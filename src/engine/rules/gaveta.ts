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
  sistema?: 'telescopica' | 'invisivel' // default: telescopica
  espessura?: number // default: rules.gavetaEspessuraLateral
}

export function computeGavetaCaixa(
  g: GavetaBox,
  materialId: string,
  rules: EngineRules,
): Piece[] {
  const lateralEsp = g.espessura ?? rules.gavetaEspessuraLateral
  const contraEsp = lateralEsp
  const sistema = g.sistema ?? 'telescopica'
  const pieces: Piece[] = []

  if (sistema === 'invisivel') {
    // Invisível (slow): Laterais recuadas 1,3mm (13mm para as corrediças nas laterais)
    // com rasgo de 7mm para encaixe do fundo neste canal.
    // Contra-frente e contra-fundo: fundo parafusado nelas.
    const recuoLateral = rules.gavetaRebaixoEspaco // 13mm
    const larguraEfetiva = g.largura - 2 * recuoLateral
    const innerW = larguraEfetiva - 2 * lateralEsp
    const frontZ = g.profundidade - rules.gavetaContraRecuo
    const backZ = rules.gavetaContraRecuo

    // Laterais
    for (const side of ['L', 'R'] as const) {
      const x = side === 'L' ? g.x + recuoLateral : g.x + g.largura - recuoLateral - lateralEsp
      pieces.push(
        box({
          name: `Gaveta lateral ${side} (invisível)`,
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
        position: { x: g.x + recuoLateral + lateralEsp, y: g.y, z: frontZ - contraEsp },
        materialId,
      }),
      box({
        name: 'Gaveta contra-fundo',
        w: innerW,
        h: g.altura,
        d: contraEsp,
        position: { x: g.x + recuoLateral + lateralEsp, y: g.y, z: backZ },
        materialId,
      }),
    )

    // Fundo encaixado no rasgo de 7mm (profundidade) das laterais
    const rasgoProf = rules.gavetaRasgoProfundidade
    const fundoW = innerW + 2 * rasgoProf
    const fundoD = g.profundidade - 2 * rules.gavetaContraRecuo
    pieces.push(
      box({
        name: 'Gaveta fundo',
        w: fundoW,
        h: rules.gavetaFundoEspessura,
        d: fundoD,
        position: { x: g.x + recuoLateral + lateralEsp - rasgoProf, y: g.y, z: backZ },
        materialId,
        grainDirection: 'horizontal',
      }),
    )
  } else {
    // Telescópica: Rebaixo de 7mm de profundidade × 1.3mm de espaço nas laterais.
    // Contra-frente e contra-fundo recuadas 5mm em relação à lateral.
    const innerW = g.largura - 2 * lateralEsp
    const frontZ = g.profundidade - rules.gavetaContraRecuo
    const backZ = rules.gavetaContraRecuo

    // Laterais
    for (const side of ['L', 'R'] as const) {
      const x = side === 'L' ? g.x : g.x + g.largura - lateralEsp
      pieces.push(
        box({
          name: `Gaveta lateral ${side} (telescópica)`,
          w: lateralEsp,
          h: g.altura,
          d: g.profundidade,
          position: { x, y: g.y, z: g.z },
          materialId,
          edgeBanding: { top: true, bottom: true },
        }),
      )
    }

    // Contra-frente/contra-fundo recuadas 5mm em relação à lateral
    const recuoContra = rules.gavetaContraRecuo // 5mm
    pieces.push(
      box({
        name: 'Gaveta contra-frente',
        w: innerW,
        h: g.altura - recuoContra,
        d: contraEsp,
        position: { x: g.x + lateralEsp, y: g.y + recuoContra, z: frontZ - contraEsp },
        materialId,
      }),
      box({
        name: 'Gaveta contra-fundo',
        w: innerW,
        h: g.altura - recuoContra,
        d: contraEsp,
        position: { x: g.x + lateralEsp, y: g.y + recuoContra, z: backZ },
        materialId,
      }),
    )

    // Fundo parafusado por baixo
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
  }

  return pieces
}
