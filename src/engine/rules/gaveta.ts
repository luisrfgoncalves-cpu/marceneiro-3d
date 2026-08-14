// Sistemas de gaveta (Seção 5.2) — telescópica e invisível (slow).
// Telescópica: rebaixo 7×1,3 só nas laterais; contra-frente/contra-fundo
// recuadas 5mm; fundo parafusado.
// Invisível: aplicável em gavetas de 15mm; laterais recuadas 1,3mm com rasgo
// de 7mm para o fundo; fundo parafusado na contra-frente e contra-fundo.

import type { EngineRules } from '../rules'
import { box } from '../geometry'
import type { Piece } from '../types'

export interface GavetaBox {
  x: number // posição esquerda da gaveta (mm)
  y: number // base da gaveta (mm)
  z: number // traseira da gaveta (mm)
  largura: number // largura disponível p/ a gaveta
  profundidade: number // profundidade da gaveta
  altura: number // altura da caixa da gaveta
}

export function computeGavetaCaixa(
  g: GavetaBox,
  materialId: string,
  rules: EngineRules,
): Piece[] {
  const lateralEsp = rules.gavetaEspessuraLateral
  const innerW = g.largura - 2 * lateralEsp
  const contraEsp = lateralEsp
  const frontZ = g.profundidade - rules.gavetaContraRecuo
  const backZ = rules.gavetaContraRecuo

  const pieces: Piece[] = []

  // Laterais da gaveta (2)
  for (const side of ['L', 'R'] as const) {
    const x = side === 'L' ? g.x : g.x + g.largura - lateralEsp
    pieces.push(
      box({
        name: `Gaveta lateral ${side}`,
        w: lateralEsp,
        h: g.altura,
        d: g.profundidade,
        position: { x, y: g.y, z: g.z },
        materialId,
        edgeBanding: { top: true, bottom: true },
      }),
    )
  }

  // Contra-frente e contra-fundo
  pieces.push(
    box({
      name: 'Gaveta contra-frente',
      w: innerW,
      h: g.altura,
      d: contraEsp,
      position: { x: g.x + lateralEsp, y: g.y, z: frontZ - contraEsp },
      materialId,
    }),
    box({
      name: 'Gaveta contra-fundo',
      w: innerW,
      h: g.altura,
      d: contraEsp,
      position: { x: g.x + lateralEsp, y: g.y, z: backZ },
      materialId,
    }),
  )

  // Fundo da gaveta — entre contra-frente e contra-fundo
  const fundoD = g.profundidade - 2 * rules.gavetaContraRecuo
  pieces.push(
    box({
      name: 'Gaveta fundo',
      w: innerW,
      h: rules.gavetaFundoEspessura,
      d: fundoD,
      position: { x: g.x + lateralEsp, y: g.y, z: backZ },
      materialId,
      grainDirection: 'horizontal',
    }),
  )

  return pieces
}
