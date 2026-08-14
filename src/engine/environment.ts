// Projeto por ambiente (Seção 11.7) — um projeto é sempre um ambiente completo
// (cozinha inteira, quarto inteiro), nunca peças avulsas. Módulos têm posição
// relativa entre si para gerar a visualização de conjunto.

import type { EngineRules } from './rules'
import { computeModule } from './computeModule'
import type { Ambiente, ModuloConfig, ModuleResult, Piece } from './types'

export interface ModuleInstance {
  id: string
  nome: string
  config: ModuloConfig
}

export type ProjectStatus = 'rascunho' | 'aprovado'

export interface EnvironmentProject {
  id: string
  nome: string
  cliente: string
  clienteId: string | null
  ambiente: Ambiente
  modulos: ModuleInstance[]
  status: ProjectStatus
  updatedAt: string
}

export interface PlacedPiece extends Piece {
  moduleId: string
  moduleNome: string
}

export interface PlacedModule {
  module: ModuleInstance
  result: ModuleResult
  offsetX: number
  width: number
}

/** Largura efetiva ocupada pelo módulo no ambiente (inclui pingadeira lateral). */
export function moduleEffectiveWidth(config: ModuloConfig): number {
  return config.largura + 2 * config.tampo.pingadeiraLados
}

/**
 * Posiciona os módulos lado a lado (método padrão: módulos encostados — Seção
 * 5.9) e devolve as peças já transladadas para a coordenada do ambiente.
 * Função pura.
 */
export function layoutEnvironment(
  project: Pick<EnvironmentProject, 'modulos'>,
  rules: EngineRules,
): { pieces: PlacedPiece[]; placed: PlacedModule[]; totalWidth: number } {
  const placed: PlacedModule[] = []
  const pieces: PlacedPiece[] = []
  let offsetX = 0

  for (const module of project.modulos) {
    const result = computeModule(module.config, rules)
    const width = moduleEffectiveWidth(module.config)
    for (const p of result.pieces) {
      pieces.push({
        ...p,
        position: { ...p.position, x: p.position.x + offsetX },
        moduleId: module.id,
        moduleNome: module.nome,
      })
    }
    placed.push({ module, result, offsetX, width })
    offsetX += width
  }

  return { pieces, placed, totalWidth: offsetX }
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

// Sugestão de módulos por ambiente (Seção 11.4 passo 2).
export const AMBIENTE_SUGESTOES: Record<Ambiente, string[]> = {
  cozinha: ['balcao_2p_2g', 'balcao_2p', 'balcao_2p'],
  dormitorio: ['gaveteiro', 'gaveteiro'],
  banheiro: ['balcao_2p'],
  area_servico: ['balcao_2p_2g'],
  sala: [],
}
