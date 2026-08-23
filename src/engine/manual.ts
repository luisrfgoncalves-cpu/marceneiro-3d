// Manual de montagem (Fase 5) — sequência canônica de montagem por módulo,
// derivada das peças calculadas pelo motor. Função pura, sem dependências.

import type { EngineRules } from './rules'
import type { EnvironmentProject } from './environment'
import { layoutEnvironment } from './environment'
import { computeModule } from './computeModule'

export interface ManualStep {
  ordem: number
  titulo: string
  itens: string[]
}

export interface ModuleManual {
  modulo: string
  steps: ManualStep[]
  pecasTotal: number
}

export interface AssemblyManual {
  modulos: ModuleManual[]
  pecasTotal: number
}

interface Grupo {
  titulo: string
  match: RegExp
}

const GRUPOS: Grupo[] = [
  { titulo: '1. Caixaria', match: /^(Lateral|Base|Chap|Chapeu|Fundo\b.*|Montante|Taponamento|Orelha)/i },
  { titulo: '2. Prateleiras e internos fixos', match: /(Prateleira|Sapateira|Maleiro)/i },
  { titulo: '3. Caixas de gaveta', match: /^Gaveta /i },
  { titulo: '4. Frentes de gaveta', match: /^Frente gaveta/i },
]

/** Sequência de montagem de um módulo a partir das peças calculadas. */
export function moduleAssemblySteps(result: ReturnType<typeof computeModule>): ManualStep[] {
  const steps: ManualStep[] = []

  for (const g of GRUPOS) {
    const itens = result.pieces.filter((p) => g.match.test(p.name)).map((p) => `${p.name} — ${Math.round(p.w)}×${Math.round(p.h)}mm`)
    if (itens.length > 0) steps.push({ ordem: steps.length + 1, titulo: g.titulo, itens })
  }

  const portas = result.pieces.filter((p) => /^Porta \d/.test(p.name))
  if (portas.length > 0) {
    const itens = portas.map((p) => `${p.name} — ${Math.round(p.w)}×${Math.round(p.h)}mm`)
    if (result.hinges.length > 0) itens.push(`Dobradiças: ${result.hinges.length} un (10cm das pontas)`)
    if (result.pistons.length > 0) itens.push(`Pistões a gás: ${result.pistons.length} un`)
    itens.push('Puxadores: instalar no lado oposto às dobradiças')
    steps.push({ ordem: steps.length + 1, titulo: '5. Portas e puxadores', itens })
  }

  return steps
}

/**
 * Manual completo do ambiente: um bloco por módulo na ordem do projeto.
 */
export function buildAssemblyManual(
  project: Pick<EnvironmentProject, 'modulos'>,
  rules: EngineRules,
): AssemblyManual {
  const { placed } = layoutEnvironment(project, rules)
  const modulos: ModuleManual[] = placed.map((pm) => ({
    modulo: pm.module.nome || pm.module.config.moduloTipo,
    steps: moduleAssemblySteps(pm.result),
    pecasTotal: pm.result.pieces.length,
  }))
  return { modulos, pecasTotal: modulos.reduce((s, m) => s + m.pecasTotal, 0) }
}

/** Link público de visualização 3D do projeto (para QR do manual). */
export function shareViewUrl(projectId: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/?view=${projectId}`
}
