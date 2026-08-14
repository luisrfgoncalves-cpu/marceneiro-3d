// Taponamento (Seção 5.3).
// Espessura 15 ou 18mm; permitido SOMENTE nas laterais (nunca na base, nunca
// no montante). Avanço frontal e lados configuráveis de forma independente.
// "Sem taponamento" também é um caso válido.

import type { EngineRules } from '../rules'
import { box } from '../geometry'
import type { Piece, TaponamentoLado } from '../types'

export interface TaponamentoArgs {
  lado: TaponamentoLado
  side: 'esquerda' | 'direita'
  moduleWidth: number
  moduleDepth: number
  height: number // altura da área onde o taponamento atua (da base ao tampo)
  y: number // base do taponamento (Y do módulo, mm)
  materialId: string
}

export function computeTaponamento(
  a: TaponamentoArgs,
  rules: EngineRules,
): Piece[] {
  if (!a.lado.ativo) return []
  const esp = a.lado.espessura
  const overlap = rules.taponamentoOverlap
  const d = overlap + a.lado.avancao
  const z = a.moduleDepth - overlap
  const x = a.side === 'esquerda' ? 0 : a.moduleWidth - esp
  return [
    box({
      name: a.side === 'esquerda' ? 'Taponamento esquerdo' : 'Taponamento direito',
      w: esp,
      h: a.height,
      d,
      position: { x, y: a.y, z },
      materialId: a.materialId,
      edgeBanding: { top: true, bottom: true },
    }),
  ]
}
