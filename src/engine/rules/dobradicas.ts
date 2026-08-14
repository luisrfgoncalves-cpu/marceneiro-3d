// Dobradiças (Seção 4.1) — regra fixa de posicionamento:
// primeira e última sempre a 10cm das extremidades da porta; as demais
// divididas em espaçamentos iguais. Nunca uma dobradiça pode coincidir com a
// posição de uma prateleira interna — o sistema realoca automaticamente.

import type { EngineRules } from '../rules'
import type { Hinge } from '../types'

export interface HingeInput {
  doorId: string
  doorHeightMm: number
  doorTopY: number // posição Y do topo da porta no módulo (mm)
  count: number
}

/** Posições das dobradiças em mm, medidas do topo da porta. */
export function computeHingeOffsets(input: HingeInput, regras: EngineRules): Hinge[] {
  const { doorHeightMm: h, count } = input
  const ponta = regras.dobradicaPontaDistancia
  const hinges: Hinge[] = []

  if (count <= 0) return hinges

  if (count === 1) {
    hinges.push({ doorId: input.doorId, yMm: h / 2, relocated: false })
    return hinges
  }

  if (count === 2) {
    hinges.push(
      { doorId: input.doorId, yMm: ponta, relocated: false },
      { doorId: input.doorId, yMm: h - ponta, relocated: false },
    )
    return hinges
  }

  const last = h - ponta
  const step = (last - ponta) / (count - 1)
  for (let i = 0; i < count; i += 1) {
    hinges.push({ doorId: input.doorId, yMm: ponta + i * step, relocated: false })
  }
  return hinges
}

export interface ConflictZone {
  top: number // borda superior da zona de conflito (Y do módulo, mm)
  bottom: number // borda inferior da zona
}

/**
 * Realoca dobradiças intermediárias que coincidem com zonas de conflito
 * (prateleiras/montantes). A primeira e a última são fixas (10cm das pontas);
 * as intermediárias deslocam para o lado mais próximo, respeitando os limites.
 */
export function resolveHingeConflicts(
  hinges: Hinge[],
  doorTopY: number,
  zones: ConflictZone[],
  regras: EngineRules,
): { hinges: Hinge[]; relocations: number } {
  const tol = regras.dobradicaToleranciaConflito
  const ponta = regras.dobradicaPontaDistancia
  const result: Hinge[] = hinges.map((h) => ({ ...h }))
  const lastIdx = result.length - 1
  const maxY = lastIdx > 0 ? result[lastIdx].yMm : result[0]?.yMm ?? ponta
  let relocations = 0

  for (let i = 1; i < lastIdx; i += 1) {
    const h = result[i]
    let absY = doorTopY + h.yMm
    let moved = false
    for (const zone of zones) {
      if (absY > zone.bottom - tol && absY < zone.top + tol) {
        const distTop = zone.top - absY
        const distBottom = absY - zone.bottom
        absY = distTop <= distBottom ? zone.top + tol : zone.bottom - tol
        moved = true
      }
    }
    if (moved) {
      h.yMm = Math.min(Math.max(absY - doorTopY, ponta), maxY)
      h.relocated = true
      relocations += 1
    }
  }
  return { hinges: result, relocations }
}
