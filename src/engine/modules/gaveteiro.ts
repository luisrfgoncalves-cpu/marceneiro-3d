// Módulo Gaveteiro de guarda-roupa (Seção 6.2).
// Caixa = laterais + montante deitado na frente (em cima e embaixo) + montante
// deitado atrás (10cm de largura, por dentro das laterais). Frentes com
// espaçamento de 3cm; primeira frente embutida 6mm abaixo do montante inferior.
// Maleiro no topo (gaveta rasa, frente de 6mm) e sapateiras opcionais.

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import { computeFundo } from '../rules/fundo'
import { computeGavetaCaixa } from '../rules/gaveta'
import type { Hinge, ModuloConfig, Piece, Warning } from '../types'

interface FrenteItem {
  tipo: 'gaveta' | 'sapateira'
  index: number
  altura: number
  espessura: number
}

export function computeGaveteiro(config: ModuloConfig, rules: EngineRules) {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const pieces: Piece[] = []
  const hinges: Hinge[] = []
  const warnings: Warning[] = []

  const montanteLargura = rules.montanteGaveteiroLargura
  const montanteEsp = rules.montanteEspessura
  const orelhinha = config.orelhinha.ativo ? config.orelhinha.largura : 0
  const lateralD = P + orelhinha

  // Laterais (altura total) — com orelhinha projetando para a frente
  for (const side of ['L', 'R'] as const) {
    pieces.push(
      box({
        name: side === 'L' ? 'Lateral esquerda' : 'Lateral direita',
        w: ec,
        h: A,
        d: lateralD,
        position: { x: side === 'L' ? 0 : L - ec, y: 0, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
  }

  // Montantes deitados na frente (em cima e embaixo) — 10cm, por dentro
  for (const pos of ['inferior', 'superior'] as const) {
    const y = pos === 'inferior' ? 0 : A - montanteLargura
    pieces.push(
      box({
        name: `Montante ${pos} (frente)`,
        w: L - 2 * ec,
        h: montanteLargura,
        d: P,
        position: { x: ec, y, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
  }

  // Montante deitado atrás
  const fundoEsp = rules.fundoEspessuraPadrao
  pieces.push(
    box({
      name: 'Montante traseiro',
      w: L - 2 * ec,
      h: A - 2 * montanteLargura,
      d: montanteEsp,
      position: { x: ec, y: montanteLargura, z: fundoEsp },
      materialId: config.materialExterno,
    }),
  )

  // Interior (entre montantes)
  const interior: Region = {
    x: ec,
    y: montanteLargura,
    w: L - 2 * ec,
    h: A - 2 * montanteLargura,
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
  let cursorTop = montanteLargura - rules.frenteEmbutidaMontante

  for (const item of items) {
    const y = cursorTop - item.altura
    pieces.push(
      box({
        name: item.tipo === 'gaveta' ? `Frente gaveta ${item.index + 1}` : `Frente sapateira ${item.index + 1}`,
        w: interior.w,
        h: item.altura,
        d: item.espessura,
        position: { x: interior.x, y, z: P - item.espessura },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
    if (item.tipo === 'gaveta') {
      const gavetaAltura = rules.gavetaAlturaPadrao
      const gavetaY = Math.max(y + (item.altura - gavetaAltura), montanteLargura)
      pieces.push(
        ...computeGavetaCaixa(
          {
            x: interior.x,
            y: gavetaY,
            z: 0,
            largura: interior.w,
            profundidade: P - rules.gavetaRecuoTrilho,
            altura: gavetaAltura,
            sistema: config.gavetas.sistema,
            espessura: config.gavetas.espessura,
          },
          config.materialInterno,
          rules,
        ),
      )
    }
    cursorTop = y - gap
  }

  // Maleiro no topo (prateleira do gaveteiro — gaveta rasa, frente 6mm)
  if (config.prateleiras.quantidade > 0) {
    const maleiroAltura = rules.maleiroFrenteAltura
    const maleiroEsp = rules.maleiroFrenteEspessura
    const maleiroY = zonaTop - maleiroAltura
    pieces.push(
      box({
        name: 'Frente maleiro',
        w: interior.w,
        h: maleiroAltura,
        d: maleiroEsp,
        position: { x: interior.x, y: maleiroY, z: P - maleiroEsp },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
    // caixa rasa do maleiro
    pieces.push(
      ...computeGavetaCaixa(
        {
          x: interior.x,
          y: maleiroY,
          z: 0,
          largura: interior.w,
          profundidade: P - rules.gavetaRecuoTrilho,
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

  return { pieces, hinges, pistons: [], warnings }
}
