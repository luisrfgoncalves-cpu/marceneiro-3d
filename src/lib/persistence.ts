// Persistência à prova de falhas: grava no Supabase quando disponível e faz
// espelho em localStorage (offline-first). Nenhuma ação do marceneiro se perde.
// Atualizado para suportar Supabase Auth e preencher userId nas tabelas.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { computeModule } from '../engine/computeModule'
import { layoutEnvironment, uid, type EnvironmentProject, type ModuleInstance } from '../engine/environment'
import type { EngineRules } from '../engine/rules'
import type { DbCliente } from './db'

const LS_PROJECTS = 'marceneiro3d_projects'

export interface SaveResult {
  ok: boolean
  offline: boolean
}

export class Persistence {
  private supabase: SupabaseClient | null = null

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
    if (url && anon) this.supabase = createClient(url, anon)
  }

  get hasBackend(): boolean {
    return this.supabase !== null
  }

  // ---- AuthDelegates ----
  async signUp(email: string, pass: string) {
    if (!this.supabase) throw new Error('Supabase indisponível')
    return this.supabase.auth.signUp({ email, password: pass })
  }

  async signIn(email: string, pass: string) {
    if (!this.supabase) throw new Error('Supabase indisponível')
    return this.supabase.auth.signInWithPassword({ email, password: pass })
  }

  async signOut() {
    if (this.supabase) {
      await this.supabase.auth.signOut()
    }
  }

  async getCurrentUser() {
    if (!this.supabase) return null
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      return user
    } catch {
      return null
    }
  }

  private async getUserId(): Promise<string | null> {
    if (!this.supabase) return null
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      return user?.id ?? null
    } catch {
      return null
    }
  }

  // ---- espelho local (nunca lança erro) ----
  private lsLoadProjects(): EnvironmentProject[] {
    try {
      const raw = localStorage.getItem(LS_PROJECTS)
      return raw ? (JSON.parse(raw) as EnvironmentProject[]) : []
    } catch {
      return []
    }
  }

  private lsSaveProjects(projects: EnvironmentProject[]): void {
    try {
      localStorage.setItem(LS_PROJECTS, JSON.stringify(projects))
    } catch {
      // armazenamento cheio/indisponível — segue sem persistir o espelho
    }
  }

  private lsDeleteProject(id: string): void {
    this.lsSaveProjects(this.lsLoadProjects().filter((p) => p.id !== id))
  }

  // ---- clientes ----
  async loadClients(): Promise<DbCliente[]> {
    if (this.supabase) {
      try {
        const userId = await this.getUserId()
        if (userId) {
          const { data, error } = await this.supabase
            .from('clientes')
            .select('id,nome,contato')
            .eq('userId', userId)
            .order('created_at')
          if (!error && data) return data as DbCliente[]
        }
      } catch {
        // segue para fallback local
      }
    }
    const names = new Map<string, DbCliente>()
    for (const p of this.lsLoadProjects()) {
      if (p.cliente && !names.has(p.cliente)) names.set(p.cliente, { id: p.clienteId ?? uid(), nome: p.cliente, contato: null })
    }
    return [...names.values()]
  }

  async addCliente(nome: string, contato = ''): Promise<DbCliente> {
    const cliente: DbCliente = { id: uid(), nome, contato: contato || null }
    if (this.supabase) {
      try {
        const userId = await this.getUserId()
        if (userId) {
          await this.supabase.from('clientes').upsert({ ...cliente, userId }, { onConflict: 'id' })
        }
      } catch {
        // offline — cliente será recriado quando o projeto for salvo
      }
    }
    return cliente
  }

  // ---- projetos ----
  async loadProjects(): Promise<EnvironmentProject[]> {
    if (this.supabase) {
      try {
        const userId = await this.getUserId()
        if (userId) {
          const { data: rows, error } = await this.supabase
            .from('projects')
            .select('id,nome,ambiente,cliente,status,updated_at')
            .eq('userId', userId)
            .order('updated_at', { ascending: false })
          if (!error && rows) {
            const ids = rows.map((r) => r.id)
            const { data: modRows } = ids.length
              ? await this.supabase.from('project_modules').select('id,project_id,config,posicao,ordem').in('project_id', ids)
              : { data: [] }
            const byProject = new Map<string, Array<{ id: string; config: Record<string, unknown>; ordem: number }>>()
            for (const m of modRows ?? []) {
              const arr = byProject.get(m.project_id) ?? []
              arr.push(m as { id: string; config: Record<string, unknown>; ordem: number })
              byProject.set(m.project_id, arr)
            }
            return rows.map((r) => this.fromRow(r as never, byProject.get(r.id) ?? []))
          }
        }
      } catch {
        // segue para fallback local
      }
    }
    return this.lsLoadProjects()
  }

  async loadSharedProject(projectId: string): Promise<EnvironmentProject | null> {
    if (!this.supabase) return null
    try {
      const { data: row, error } = await this.supabase
        .from('projects')
        .select('id,nome,ambiente,cliente,status,updated_at')
        .eq('id', projectId)
        .maybeSingle()
      if (error || !row) return null

      const { data: modRows } = await this.supabase
        .from('project_modules')
        .select('id,project_id,config,posicao,ordem')
        .eq('project_id', projectId)

      const modules = (modRows ?? []).map(m => m as { id: string; config: Record<string, unknown>; ordem: number })
      return this.fromRow(row as never, modules)
    } catch {
      return null
    }
  }

  private fromRow(
    row: { id: string; nome: string; ambiente: string; cliente: string; status: string; updated_at: string },
    modules: Array<{ id: string; config: Record<string, unknown>; ordem: number }>,
  ): EnvironmentProject {
    const modulos: ModuleInstance[] = modules
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map((m) => {
        const config = m.config as unknown as EnvironmentProject['modulos'][number]['config']
        return { id: m.id, nome: (config.nome as string) ?? 'Módulo', config }
      })
    return {
      id: row.id,
      nome: row.nome,
      cliente: row.cliente,
      clienteId: null,
      ambiente: this.toAmbiente(row.ambiente),
      modulos,
      status: row.status === 'aprovado' ? 'aprovado' : 'rascunho',
      updatedAt: row.updated_at,
    }
  }

  private toAmbiente(ambiente: string): EnvironmentProject['ambiente'] {
    const valid: Array<EnvironmentProject['ambiente']> = ['cozinha', 'dormitorio', 'banheiro', 'area_servico', 'sala']
    return (valid as string[]).includes(ambiente) ? (ambiente as EnvironmentProject['ambiente']) : 'cozinha'
  }

  async saveProject(project: EnvironmentProject, rules: EngineRules): Promise<SaveResult> {
    let offline = !this.supabase
    const userId = await this.getUserId()

    if (this.supabase && userId) {
      try {
        const { placed } = layoutEnvironment(project, rules)
        await this.supabase.from('projects').upsert(
          {
            id: project.id,
            nome: project.nome,
            ambiente: project.ambiente,
            cliente: project.cliente,
            status: project.status,
            updated_at: new Date().toISOString(),
            userId: userId,
          },
          { onConflict: 'id' },
        )
        await this.supabase.from('project_modules').delete().eq('project_id', project.id)
        for (const p of placed) {
          const moduleId = p.module.id
          const pieces = computeModule(p.module.config, rules).pieces
          await this.supabase.from('project_modules').insert({
            id: moduleId,
            project_id: project.id,
            modulo_tipo: p.module.config.moduloTipo,
            config: p.module.config as unknown as Record<string, unknown>,
            posicao: { x: p.offsetX, y: 0, rotacao: 0 },
            ordem: project.modulos.findIndex((m) => m.id === moduleId),
          })
          await this.supabase.from('project_module_pecas').insert(
            pieces.map((pc) => ({
              id: uid(),
              module_id: moduleId,
              nome: pc.name,
              dimensao: { w: pc.w, h: pc.h, d: pc.d },
              posicao: { x: pc.position.x + p.offsetX, y: pc.position.y, z: pc.position.z },
              rotacao: pc.rotation,
              material_id: pc.materialId,
              veio: pc.grainDirection,
            })),
          )
        }
      } catch {
        offline = true
      }
    } else {
      offline = true
    }

    // Espelho local sempre (funciona 100% offline)
    const all = this.lsLoadProjects().filter((p) => p.id !== project.id)
    this.lsSaveProjects([{ ...project, updatedAt: new Date().toISOString() }, ...all])

    return { ok: true, offline }
  }

  async deleteProject(id: string): Promise<void> {
    if (this.supabase) {
      try {
        const userId = await this.getUserId()
        if (userId) {
          await this.supabase.from('project_modules').delete().eq('project_id', id)
          await this.supabase.from('projects').delete().eq('id', id)
        }
      } catch {
        // segue com o espelho local
      }
    }
    this.lsDeleteProject(id)
  }
}
