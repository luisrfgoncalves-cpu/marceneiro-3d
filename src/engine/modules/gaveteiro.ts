// Módulo Gaveteiro de guarda-roupa (Seção 6.2).
// Caixa = laterais + montante deitado na frente (em cima e embaixo) + montante
// deitado atrás (10cm de largura, por dentro das laterais). Frentes com
// espaçamento de 3cm; primeira frente embutida 6mm abaixo do montante inferior.
// Maleiro no topo (gaveta rasa, frente de 6mm) e sapateiras opcionais.

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import { computeFundo } from '../rules/fundo'
import { computeGavetaCaixa } from '../rules/gaveta'
import type { ModuloConfig, Piece, Warning } from '../types'

interface FrenteItem {
  tipo: 'gaveta' | 'sapateira'
  index: number
  altura: number
  espessura: number
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function computeGaveteiro(config: ModuloConfig, rules: EngineRules) {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const pieces: Piece[] = []
  const warnings: Warning[] = []

  // Montante deitado na frente tem largura fixa de 10cm (100mm) por regra
  const MONTANTE_LARGURA = rules.montanteGaveteiroLargura
  const orelhinha = config.orelhinha.ativo ? config.orelhinha.largura : 0
  const lateralD = P + orelhinha

  // Laterais (altura total) — com orelhinha projetando para a frente
  for (const side of ['L', 'R'] as const) {
    pieces.push(
      box({
        name: side === 'L' ? 'Lateral esquerda' : 'Lateral direita',
        w: clamp(ec, 1, L - 1),
        h: clamp(A, 1, 500),
        d: lateralD,
        position: { x: side === 'L' ? 0 : clamp(L - ec, 1, L - 1), y: 0, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
  }

  // Montantes deitados na frente (em cima e embaixo) — 10cm, por dentro
  for (const pos of ['inferior', 'superior'] as const) {
    const y = pos === 'inferior' ? 0 : A - MONTANTE_LARGURA
    pieces.push(
      box({
        name: `Montante ${pos} (frente)`,
        w: clamp(L - 2 * ec, 1, L - 1),
        h: clamp(MONTANTE_LARGURA, 1, L - 1),
        d: clamp(P, 1, 500),
        position: { x: clamp(ec, 1, L - 2), y: y, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
  }

  // Montante deitado atrás (10cm de largura, por dentro das laterais)
  const fundoEsp = Math.max(1, rules.fundoEspessuraPadrao)
  pieces.push(
    box({
      name: 'Montante traseiro',
      w: clamp(L - 2 * ec, 1, L - 1),
      h: clamp(A - 2 * MONTANTE_LARGURA, 1, A - 1),
      d: fundoEsp,
      position: { x: clamp(ec, 1, L - 2), y: MONTANTE_LARGURA, z: fundoEsp },
      materialId: config.materialExterno,
    }),
  )

  // Interior (entre montantes)
  const interior: Region = {
    x: clamp(ec, 1, L - 2),
    y: MONTANTE_LARGURA,
    w: clamp(L - 2 * ec, 1, L - 2),
    h: clamp(A - 2 * MONTANTE_LARGURA, 1, A - 1),
    z: 0,
    d: P,
  }

  // Fundo
  pieces.push(...computeFundo(config.sistemaFundo, interior, ec, config.materialInterno, rules))

  // Frentes (gavetas + sapateiras) empilhadas de baixo para cima
  const items: FrenteItem[] = [
    ...Array.from({ length: config.gavetas.quantidade }, (_, i) => ({
      tipo: 'gaveta' as const,
      index: i,
      altura: rules.gavetaFrenteAltura,
      espessura: rules.gavetaFrenteEspessura,
    })),
    ...Array.from({ length: config.sapateiras.quantidade }, (_, i) => ({
      tipo: 'sapateira' as const,
      index: i,
      altura: rules.sapateiraFrenteAltura,
      espessura: rules.gavetaFrenteEspessura,
    })),
  ]

  const zonaTop = interior.y + interior.h
  const gap = rules.gavetaFrenteGap
  const FRENTE_EMBUTIDA = rules.frenteEmbutidaMontante
  let cursorTop = MONTANTE_LARGURA - FRENTE_EMBUTIDA

  for (const item of items) {
    const y = clamp(cursorTop - item.altura, 1, zonaTop - 1)
    pieces.push(
      box({
        name: item.tipo === 'gaveta' ? `Frente gaveta ${item.index + 1}` : `Frente sapateira ${item.index + 1}`,
        w: clamp(interior.w, 1, L - 1),
        h: clamp(item.altura, 1, 500),
        d: clamp(item.espessura, 1, 200),
        position: { x: clamp(interior.x, 1, L - 2), y: y, z: clamp(P - item.espessura, 1, P - 1) },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
    if (item.tipo === 'gaveta') {
      const gavetaAltura = rules.gavetaAlturaPadrao
      const gavetaY = Math.max(y + (item.altura - gavetaAltura), MONTANTE_LARGURA)
      pieces.push(
        ...computeGavetaCaixa(
          {
            x: clamp(interior.x, 1, L - 2),
            y: gavetaY,
            z: 0,
            largura: clamp(interior.w, 1, L - 1),
            profundidade: Math.max(1, P - rules.gavetaRecuoTrilho),
            altura: gavetaAltura,
            sistema: config.gavetas.sistema,
            espessura: config.gavetas.espessura,
          },
          config.materialInterno,
          rules,
        ),
      )
    }
    cursorTop = Math.max(1, y - gap)
  }

  // Maleiro no topo (prateleira do gaveteiro — gaveta rasa, frente 6mm)
  if (config.prateleiras.quantidade > 0) {
    const maleiroAltura = Math.max(1, rules.maleiroFrenteAltura)
    const maleiroEsp = Math.max(1, rules.maleiroFrenteEspessura)
    const maleiroY = Math.max(1, zonaTop - maleiroAltura)
    pieces.push(
      box({
        name: 'Frente maleiro',
        w: clamp(interior.w, 1, L - 1),
        h: maleiroAltura,
        d: maleiroEsp,
        position: { x: clamp(interior.x, 1, L - 2), y: maleiroY, z: Math.max(1, P - maleiroEsp) },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
    pieces.push(
      ...computeGavetaCaixa(
        {
          x: clamp(interior.x, 1, L - 2),
          y: maleiroY,
          z: 0,
          largura: clamp(interior.w, 1, L - 1),
          profundidade: Math.max(1, P - rules.gavetaRecuoTrilho),
          altura: maleiroAltura,
          sistema: config.gavetas.sistema,
          espessura: config.gavetas.espessura,
        },
        config.materialInterno,
        rules,
      ),
    )
    if (cursorTop < maleiroY + rules.vaoHorizontal) {
      warnings.push({
        type: 'vão_insuficiente',
        pieceName: 'Frentes de gaveta',
        message: 'As frentes de gaveta não cabem entre o montante inferior e o maleiro — reduza a quantidade ou a altura das gavetas.',
      })
    }
  }

  return { pieces, warnings }
}