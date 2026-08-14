// Tampo (Seção 5.4). MDF, espessura de 15mm até 3,6cm. Pingadeira
// configurável em qualquer lado, ou tampo rente — tudo ajustável.

import { box } from '../geometry'
import type { Piece } from '../types'

export interface TampoArgs {
  moduleWidth: number
  moduleDepth: number
  moduleHeight: number
  espessura: number
  pingadeiraFrente: number // mm além da frente (0 = rente)
  pingadeiraLados: number // mm além de cada lateral (0 = rente)
  materialId: string
}

export function computeTampo(a: TampoArgs): Piece[] {
  const w = a.moduleWidth + 2 * a.pingadeiraLados
  const d = a.moduleDepth + a.pingadeiraFrente
  const y = a.moduleHeight - a.espessura
  return [
    box({
      name: 'Tampo',
      w,
      h: a.espessura,
      d,
      position: { x: -a.pingadeiraLados, y, z: 0 },
      materialId: a.materialId,
      edgeBanding: { top: true, left: true, right: true, bottom: false },
      grainDirection: 'horizontal',
    }),
  ]
}
