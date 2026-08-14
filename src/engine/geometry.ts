// Helpers de construção de peças — o motor devolve peças em mm,
// a camada 3D apenas lê (Seção 10: separação motor × render).

import type { GrainDirection, Piece, Vec3 } from './types'

/** Região retangular em mm dentro do módulo (ex.: vão interior, zona de portas). */
export interface Region {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
}

let seq = 0
export function nextId(): string {
  seq += 1
  return `peca_${seq}`
}

export interface BoxArgs {
  name: string
  w: number
  h: number
  d: number
  position: Vec3
  rotation?: Vec3
  materialId: string
  edgeBandId?: string | null
  grainDirection?: GrainDirection
  edgeBanding?: Partial<Piece['edgeBanding']>
}

export function box(args: BoxArgs): Piece {
  return {
    id: nextId(),
    name: args.name,
    w: args.w,
    h: args.h,
    d: args.d,
    position: args.position,
    rotation: args.rotation ?? { x: 0, y: 0, z: 0 },
    materialId: args.materialId,
    edgeBandId: args.edgeBandId ?? null,
    grainDirection: args.grainDirection ?? 'vertical',
    edgeBanding: {
      top: args.edgeBanding?.top ?? false,
      bottom: args.edgeBanding?.bottom ?? false,
      left: args.edgeBanding?.left ?? false,
      right: args.edgeBanding?.right ?? false,
    },
  }
}

export const origin: Vec3 = { x: 0, y: 0, z: 0 }

export function round(n: number, decimals = 1): number {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

/** Maior e menor dimensão da face principal da peça (para checagem de chapa). */
export function pieceFaceDims(p: { w: number; h: number; d: number }): { major: number; minor: number } {
  const dims = [p.w, p.h, p.d].sort((a, b) => b - a)
  return { major: dims[0], minor: dims[1] }
}
