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
  /** Módulo girado 90° no ambiente (frente aponta para o lado). */
  rotacionado?: boolean
  /** Vão livre antes deste módulo em mm (negativo = sobreposição proposital). */
  gapAntes?: number
  /** Posição X absoluta da borda esquerda do footprint (mm). Ausente = empilhamento automático. */
  posX?: number
  /** Afastamento da parede traseira (mm). Padrão 0 = encostado. */
  posZ?: number
}

export type ProjectStatus = 'rascunho' | 'aprovado'

export type DecorTipo =
  | 'planta'
  | 'geladeira'
  | 'fogao'
  | 'sofa'
  | 'cama'
  | 'tapete'
  | 'tv'
  | 'luminaria'
  | 'micro_ondas'
  | 'mesa'
  | 'cadeira'
  | 'lava_roupas'

export interface DecorItem {
  id: string
  tipo: DecorTipo
  /** Posição X do centro (mm). */
  x: number
  /** Posição Z do centro (mm). */
  z: number
  rot: 0 | 90 | 180 | 270
}

export interface EnvironmentProject {
  id: string
  nome: string
  cliente: string
  clienteId: string | null
  ambiente: Ambiente
  modulos: ModuleInstance[]
  decoracoes?: DecorItem[]
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
  /** Início do footprint no eixo X do ambiente (mm). */
  offsetX: number
  /** Largura do footprint (largura ou profundidade se girado, mm). */
  width: number
  /** Profundidade do footprint no eixo Z (mm). */
  depth: number
}

/** Footprint ocupado pelo módulo no ambiente (considera pingadeira lateral e rotação 90°). */
export function moduleFootprint(
  config: ModuloConfig,
  rotacionado?: boolean,
): { width: number; depth: number } {
  const w = config.largura + 2 * config.tampo.pingadeiraLados
  const d = config.profundidade
  return rotacionado ? { width: d, depth: w } : { width: w, depth: d }
}

/** Largura efetiva ocupada pelo módulo no ambiente. */
export function moduleEffectiveWidth(config: ModuloConfig, rotacionado?: boolean): number {
  return moduleFootprint(config, rotacionado).width
}

/** Gira uma peça 90° em torno do centro do footprint do módulo (frente → +X). Função pura. */
export function rotatePiece90(piece: Piece, moduleWidth: number, moduleDepth: number): Piece {
  const w2 = moduleWidth / 2
  const d2 = moduleDepth / 2
  const pcx = piece.position.x + piece.w / 2 - w2
  const pcz = piece.position.z + piece.d / 2 - d2
  // rotação -90° em Y: frente (+Z local) passa a apontar para +X do ambiente.
  // Footprint girado: largura' = profundidade, profundidade' = largura.
  const ncx = pcz
  const ncz = -pcx
  return {
    ...piece,
    w: piece.d,
    d: piece.w,
    position: {
      x: d2 + ncx - piece.d / 2,
      y: piece.position.y,
      z: w2 + ncz - piece.w / 2,
    },
    cutouts: piece.cutouts?.map((c) => {
      const ccx = c.position.x + c.w / 2 - w2
      const ccz = c.position.z + c.d / 2 - d2
      return {
        ...c,
        w: c.d,
        d: c.w,
        position: {
          x: d2 + ccz - c.d / 2,
          y: c.position.y,
          z: w2 - ccx - c.w / 2,
        },
      }
    }),
  }
}

/**
 * Posiciona os módulos lado a lado (método padrão: módulos encostados — Seção
 * 5.9), respeitando gapAntes (vão/sobreposição), rotação 90° e posição livre
 * (posX/posZ — híbrido: ausentes = empilhamento automático intacto), e devolve
 * as peças já transladadas para a coordenada do ambiente. Função pura.
 */
export function layoutEnvironment(
  project: Pick<EnvironmentProject, 'modulos'>,
  rules: EngineRules,
): { pieces: PlacedPiece[]; placed: PlacedModule[]; totalWidth: number } {
  const placed: PlacedModule[] = []
  const pieces: PlacedPiece[] = []
  let cursor = 0

  for (const module of project.modulos) {
    const gap = Number.isFinite(module.gapAntes) ? (module.gapAntes as number) : 0
    const explicit = Number.isFinite(module.posX)
    const start = Math.max(0, explicit ? (module.posX as number) : cursor + gap)
    const posZ = Number.isFinite(module.posZ) ? Math.max(0, module.posZ as number) : 0
    const result = computeModule(module.config, rules)
    const foot = moduleFootprint(module.config, module.rotacionado)

    for (const p of result.pieces) {
      const transformed = module.rotacionado
        ? rotatePiece90(p, module.config.largura + 2 * module.config.tampo.pingadeiraLados, module.config.profundidade)
        : p
      pieces.push({
        ...transformed,
        position: { x: transformed.position.x + start, y: transformed.position.y, z: transformed.position.z + posZ },
        cutouts: transformed.cutouts?.map((c) => ({
          ...c,
          position: { ...c.position, x: c.position.x + start, z: c.position.z + posZ },
        })),
        moduleId: module.id,
        moduleNome: module.nome,
      })
    }
    placed.push({ module, result, offsetX: start, width: foot.width, depth: foot.depth })
    cursor = start + foot.width
  }

  return { pieces, placed, totalWidth: cursor }
}

/**
 * Iguala os vãos entre módulos preservando a extensão total atual do ambiente.
 * Limpa posições livres (híbrido volta ao fluxo empilhado). Função pura.
 */
export function distributeEvenly(
  modulos: ModuleInstance[],
): ModuleInstance[] {
  const reset = (m: ModuleInstance): ModuleInstance => ({ ...m, gapAntes: 0, posX: undefined, posZ: undefined })
  if (modulos.length < 3) return modulos.map(reset)
  const widths = modulos.map((m) => moduleEffectiveWidth(m.config, m.rotacionado))
  const sumW = widths.reduce((s, w) => s + w, 0)

  // extensão atual = último fim considerando gaps/posições atuais
  let end = 0
  for (const m of modulos) {
    const w = moduleEffectiveWidth(m.config, m.rotacionado)
    const start = Math.max(0, Number.isFinite(m.posX) ? (m.posX as number) : end + (m.gapAntes ?? 0))
    end = start + w
  }
  const extra = Math.max(0, end - sumW)
  const g = Math.round(extra / (modulos.length - 1))
  return modulos.map((m, i) => ({
    ...reset(m),
    gapAntes: i === 0 ? 0 : g,
  }))
}

export interface Colisao {
  aId: string
  bId: string
  overlapMm: number
}

/**
 * Detecta sobreposição entre módulos vizinhos (gaps negativos demais).
 * Retorna pares com a quantidade de mm invadidos. Função pura.
 */
export function detectCollisions(
  project: Pick<EnvironmentProject, 'modulos'>,
  rules: EngineRules,
): Colisao[] {
  const { placed } = layoutEnvironment({ modulos: project.modulos }, rules)
  const colisoes: Colisao[] = []
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const a = placed[i]
      const b = placed[j]
      const aEnd = a.offsetX + a.width
      const bEnd = b.offsetX + b.width
      const overlap = Math.min(aEnd, bEnd) - Math.max(a.offsetX, b.offsetX)
      if (overlap > 0.5) {
        colisoes.push({ aId: a.module.id, bId: b.module.id, overlapMm: Math.round(overlap) })
      }
    }
  }
  return colisoes
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
