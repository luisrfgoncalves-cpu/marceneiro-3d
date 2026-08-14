// Shell do app — navegação por estado (padrão do projeto irmão corte-sobmedida).
// Fluxo completo (Seção 11.4): Início → Novo projeto (11.4 passos 1-2) →
// Ambiente (11.7) → Biblioteca de módulos (11.2) → Ajuste com 3D ao vivo (11.3/11.5).

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { RuleStore } from './engine/configStore'
import { DEFAULT_RULES, type EngineRules } from './engine/rules'
import { uid, type EnvironmentProject, type ModuleInstance } from './engine/environment'
import type { ModuloConfig } from './engine/types'
import { PriceStore, type PriceCatalog } from './lib/prices'
import { defaultCatalog } from './engine/cost'
import { Persistence } from './lib/persistence'
import type { DbCliente } from './lib/db'
import { Home } from './pages/Home'
import { NewProject, type NewProjectData } from './pages/NewProject'
import { TemplateGrid } from './pages/TemplateGrid'

// 3D (Three.js) é carregado sob demanda — mantém o bundle inicial leve no mobile
// e a biblioteca de módulos instantânea (Seção 10/11.3).
const ModuleAdjuster = lazy(() =>
  import('./pages/ModuleAdjuster').then((m) => ({ default: m.ModuleAdjuster })),
)
const Environment = lazy(() => import('./pages/Environment').then((m) => ({ default: m.Environment })))

type Screen = 'home' | 'new_project' | 'environment' | 'grid' | 'adjuster'
type GridMode = 'add' | 'edit'

export default function App() {
  const store = useMemo(() => new RuleStore(), [])
  const persistence = useMemo(() => new Persistence(), [])
  const prices = useMemo(() => new PriceStore(), [])

  const [rules, setRules] = useState<EngineRules>(DEFAULT_RULES)
  const [catalog, setCatalog] = useState<PriceCatalog | null>(null)
  const [screen, setScreen] = useState<Screen>('home')
  const [projects, setProjects] = useState<EnvironmentProject[]>([])
  const [clients, setClients] = useState<DbCliente[]>([])
  const [current, setCurrent] = useState<EnvironmentProject | null>(null)
  const [gridMode, setGridMode] = useState<GridMode>('add')
  const [editModuleId, setEditModuleId] = useState<string | null>(null)
  const [config, setConfig] = useState<ModuloConfig | null>(null)

  useEffect(() => {
    store.load().then(() => setRules(store.getRules()))
  }, [store])

  useEffect(() => {
    Promise.all([persistence.loadProjects(), persistence.loadClients(), prices.load()]).then(([ps, cs, cat]) => {
      setProjects(ps)
      setClients(cs)
      setCatalog(cat)
    })
  }, [persistence, prices])

  const openEnvironment = useCallback(
    (project: EnvironmentProject) => {
      setCurrent(project)
      setScreen('environment')
    },
    [],
  )

  const handleCreate = async (data: NewProjectData) => {
    let clienteId = data.clienteId
    if (!clienteId) {
      const novo = await persistence.addCliente(data.cliente)
      clienteId = novo.id
      setClients((prev) => (prev.some((c) => c.id === novo.id) ? prev : [...prev, novo]))
    }
    const project: EnvironmentProject = {
      id: uid(),
      nome: data.nome,
      cliente: data.cliente,
      clienteId,
      ambiente: data.ambiente,
      modulos: [],
      status: 'rascunho',
      updatedAt: new Date().toISOString(),
    }
    setProjects((prev) => [project, ...prev])
    openEnvironment(project)
  }

  const commitModule = () => {
    if (!config || !current) return
    if (gridMode === 'add') {
      const mod: ModuleInstance = { id: uid(), nome: config.nome ?? 'Módulo', config }
      const updated = { ...current, modulos: [...current.modulos, mod] }
      setCurrent(updated)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setScreen('environment')
    } else if (editModuleId) {
      const updated = {
        ...current,
        modulos: current.modulos.map((m) => (m.id === editModuleId ? { ...m, config } : m)),
      }
      setCurrent(updated)
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setScreen('environment')
    }
  }

  const handleSave = async (): Promise<boolean> => {
    if (!current) return false
    const res = await persistence.saveProject(current, rules)
    setProjects((prev) => prev.map((p) => (p.id === current.id ? current : p)))
    return res.ok
  }

  const handleDelete = async (id: string) => {
    await persistence.deleteProject(id)
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (current?.id === id) setCurrent(null)
  }

  if (screen === 'new_project') {
    return <NewProject clients={clients} onBack={() => setScreen('home')} onCreate={handleCreate} />
  }

  if (screen === 'grid' && current) {
    return (
      <TemplateGrid
        backLabel="Projeto"
        onBack={() => setScreen('environment')}
        onSelect={(template, cfg) => {
          setConfig({ ...cfg, nome: template.nome })
          setScreen('adjuster')
        }}
      />
    )
  }

  if (screen === 'adjuster' && config) {
    return (
      <Suspense
        fallback={
          <div className="h-dvh grid place-items-center">
            <div className="text-sm text-steel-400">Carregando 3D…</div>
          </div>
        }
      >
        <ModuleAdjuster
          config={config}
          onChange={setConfig}
          rules={rules}
          catalog={catalog ?? undefined}
          confirmLabel={gridMode === 'add' ? 'Adicionar ao projeto' : 'Salvar alterações'}
          onConfirm={commitModule}
          onBack={() => setScreen(gridMode === 'edit' ? 'environment' : 'grid')}
        />
      </Suspense>
    )
  }

  if (screen === 'environment' && current) {
    return (
      <Suspense
        fallback={
          <div className="h-dvh grid place-items-center">
            <div className="text-sm text-steel-400">Carregando 3D…</div>
          </div>
        }
      >
        <Environment
        project={current}
        rules={rules}
        catalog={catalog ?? defaultCatalog()}
        onBack={() => setScreen('home')}
        onAddModule={() => {
          setGridMode('add')
          setScreen('grid')
        }}
        onEditModule={(id) => {
          const m = current.modulos.find((x) => x.id === id)
          if (!m) return
          setGridMode('edit')
          setEditModuleId(id)
          setConfig(m.config)
          setScreen('adjuster')
        }}
        onRemoveModule={(id) => {
          const updated = { ...current, modulos: current.modulos.filter((m) => m.id !== id) }
          setCurrent(updated)
          setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        }}
        onToggleStatus={() => {
          const updated: EnvironmentProject = {
            ...current,
            status: current.status === 'aprovado' ? 'rascunho' : 'aprovado',
          }
          setCurrent(updated)
          setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        }}
        onSave={handleSave}
      />
      </Suspense>
    )
  }

  return (
    <Home
      projects={projects}
      onNewProject={() => setScreen('new_project')}
      onOpen={openEnvironment}
      onDelete={handleDelete}
    />
  )
}
