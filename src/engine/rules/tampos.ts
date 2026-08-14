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
  material?: 'mdf' | 'pedra'
  cuba?: { largura: number; profundidade: number; posX: number; posZ: number }
  cooktop?: { largura: number; profundidade: number; posX: number; posZ: number }
}

export function computeTampo(a: TampoArgs): Piece[] {
  const w = a.moduleWidth + 2 * a.pingadeiraLados
  const d = a.moduleDepth + a.pingadeiraFrente
  const y = a.moduleHeight - a.espessura

  const cutouts: Piece['cutouts'] = []
  if (a.cuba) {
    cutouts.push({
      type: 'cuba',
      w: a.cuba.largura,
      d: a.cuba.profundidade,
      position: { x: a.cuba.posX, y, z: a.cuba.posZ },
    })
  }
  if (a.cooktop) {
    cutouts.push({
      type: 'cooktop',
      w: a.cooktop.largura,
      d: a.cooktop.profundidade,
      position: { x: a.cooktop.posX, y, z: a.cooktop.posZ },
    })
  }

  const name = a.material === 'pedra' ? 'Pia de pedra' : 'Tampo'

  return [
    box({
      name,
      w,
      h: a.espessura,
      d,
      position: { x: -a.pingadeiraLados, y, z: 0 },
      materialId: a.materialId,
      edgeBanding: { top: true, left: true, right: true, bottom: false },
      grainDirection: 'horizontal',
      ...(cutouts.length > 0 ? { cutouts } : {}),
    } as any),
  ]
}
