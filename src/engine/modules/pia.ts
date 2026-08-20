// Módulo Pia de Pedra (Prioridade 6)
// Gera: caixaria de balcão, tampo em pedra natural com recortes de cuba e cooktop.
// Material externo do tampo = pedra (cor própria no 3D).

import type { EngineRules } from '../rules'
import { box } from '../geometry'
import { computeFundo } from '../rules/fundo'
import type { ModuloConfig, Piece } from '../types'

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function computePia(config: ModuloConfig, rules: EngineRules): { pieces: Piece[] } {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const pia = config.pia
  const espPedra = clamp(pia?.espessuraPedra ?? 30, 20, 60)

  const pieces: Piece[] = []

  // Rodapé
  let baseY = 0
  if (config.rodape.ativo) {
    pieces.push(box({
      name: 'Rodapé',
      w: L,
      h: clamp(config.rodape.altura, 1, 500),
      d: Math.max(P - config.rodape.recuo, rules.rodapeEspessuraPadrao),
      position: { x: 0, y: 0, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { top: true, left: true, right: true },
    }))
    baseY = config.rodape.altura
  }

  // Base
  const baseW = Math.max(1, L - 2 * ec)
  pieces.push(box({
    name: 'Base',
    w: baseW,
    h: ec,
    d: P,
    position: { x: ec, y: baseY, z: 0 },
    materialId: config.materialInterno,
    edgeBanding: {},
  }))

  // Laterais
  const lateralH = Math.max(1, A - baseY - ec - espPedra)
  const lateralY = baseY + ec
  for (const side of ['L', 'R'] as const) {
    pieces.push(box({
      name: side === 'L' ? 'Lateral esquerda' : 'Lateral direita',
      w: ec,
      h: lateralH,
      d: P,
      position: { x: side === 'L' ? 0 : L - ec, y: lateralY, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { top: true, bottom: true, left: true, right: true },
    }))
  }

  // Tampo em pedra — com recortes de cuba/cooktop/torneira
  const materialPedra = stoneMaterial(pia?.materialPedra ?? 'granito')
  const cubas: NonNullable<Piece['cutouts']> = []

  if (pia?.cuba) {
    const qty = clamp(pia.cuba.quantidade ?? 1, 1, 2)
    for (let i = 0; i < qty; i++) {
      const offset = i * ((L - pia.cuba.largura) / 2)
      cubas.push({
        type: 'cuba' as const,
        w: pia.cuba.largura,
        d: pia.cuba.profundidade,
        position: {
          x: (pia.cuba.posX ?? (L - pia.cuba.largura) / 2) + offset,
          y: 0,
          z: (P - pia.cuba.profundidade) / 2,
        },
      })
    }
  }

  if (pia?.cooktop) {
    cubas.push({
      type: 'cooktop' as const,
      w: pia.cooktop.largura,
      d: pia.cooktop.profundidade,
      position: {
        x: pia.cooktop.posX ?? (L - pia.cooktop.largura) / 2,
        y: 0,
        z: (P - pia.cooktop.profundidade) / 2,
      },
    })
  }

  pieces.push({
    ...box({
      name: 'Tampo de Pedra',
      w: L + (config.tampo.pingadeiraLados * 2),
      h: espPedra,
      d: P + config.tampo.pingadeiraFrente,
      position: {
        x: -config.tampo.pingadeiraLados,
        y: A - espPedra,
        z: -config.tampo.pingadeiraFrente,
      },
      materialId: materialPedra,
      edgeBanding: { left: true, right: true, top: true },
    }),
    cutouts: cubas.length > 0 ? cubas : undefined,
  })

  // Fundo
  const interior = {
    x: ec,
    y: lateralY,
    z: 0,
    w: Math.max(1, L - 2 * ec),
    h: Math.max(1, lateralH),
    d: P,
  }
  const fundos = computeFundo(
    config.sistemaFundo,
    interior,
    ec,
    config.materialInterno,
    rules
  )
  pieces.push(...fundos)

  // Prateleiras internas (opcional)
  if (config.prateleiras.quantidade > 0) {
    const intW = Math.max(1, L - 2 * ec)
    const espPrat = config.prateleiras.espessura
    const vaoY = lateralH - espPrat
    const step = vaoY / (config.prateleiras.quantidade + 1)
    for (let i = 1; i <= config.prateleiras.quantidade; i++) {
      pieces.push(box({
        name: `Prateleira ${i}`,
        w: intW,
        h: espPrat,
        d: P - ec,
        position: { x: ec, y: lateralY + step * i, z: ec },
        materialId: config.materialInterno,
        edgeBanding: { top: true, left: true, right: true },
      }))
    }
  }

  return { pieces }
}

/** Mapeia tipo de pedra para materialId usado no render 3D */
function stoneMaterial(tipo: string): string {
  const map: Record<string, string> = {
    granito: 'pedra_granito_nero_absolute',
    marmore: 'pedra_marmore_bianco_carrara',
    quartzito: 'pedra_quartzito_arabescato',
    silestone: 'pedra_silestone_cinza_expo',
    porcelana: 'pedra_porcelana_beton_light',
  }
  return map[tipo] ?? 'pedra_granito_nero_absolute'
}
