// Orçamento instantâneo (Seção 11.6).
// Valor estimado: metragem de material usado × custo por m² + fitas + ferragens
// usadas × custo unitário. Não é o orçamento final fechado — serve para dar
// credibilidade na conversa com o cliente. Função pura (motor, sem 3D).

import type { ModuloConfig, ModuleResult } from './types'
import { pieceFaceDims } from './geometry'

export interface PriceCatalog {
  material: Record<string, number> // id do material -> R$/m²
  fita: Record<string, number> // id da fita -> R$/m
  dobradica: number // R$/unidade (slow)
  corredica: number // R$/unidade (uma lateral, medida padrão)
  corredicas?: Record<string, number> // medida (cm) -> R$/unidade
  puxador: number // R$/unidade (padrão, quando não há preço por tipo)
  puxadores?: Record<string, number> // tipo (Seção 4.3) -> R$/unidade
  pistao: number // R$/unidade (Seção 4.4)
}

export interface BudgetItem {
  label: string
  qty: number
  unit: string
  unitPrice: number
  total: number
}

export interface Budget {
  items: BudgetItem[]
  total: number
}

/** Metragem linear de fita de borda (m) de uma peça, conforme faces bandeadas. */
export function pieceEdgeBandMeters(
  piece: { w: number; h: number; d: number; edgeBanding: { top: boolean; bottom: boolean; left: boolean; right: boolean } },
): number {
  const { w, h } = piece
  const banded = piece.edgeBanding
  const top = banded.top ? w : 0
  const bottom = banded.bottom ? w : 0
  const left = banded.left ? h : 0
  const right = banded.right ? h : 0
  return (top + bottom + left + right) / 1000
}

/** Área de chapa consumida por uma peça (m²) = maior face da peça. */
export function pieceSheetAreaM2(piece: { w: number; h: number; d: number }): number {
  const { major, minor } = pieceFaceDims(piece)
  return (major * minor) / 1_000_000
}

export function estimateCost(
  config: ModuloConfig,
  result: ModuleResult,
  catalog: PriceCatalog,
): Budget {
  const items: BudgetItem[] = []

  // Material (m²) por peça, pelo preço cadastrado do material de cada peça
  let materialTotal = 0
  let materialM2 = 0
  for (const p of result.pieces) {
    const price = catalog.material[p.materialId]
    if (!price) continue
    const area = pieceSheetAreaM2(p)
    materialM2 += area
    materialTotal += area * price
  }
  items.push({ label: 'MDF/MDP', qty: materialM2, unit: 'm²', unitPrice: materialTotal / (materialM2 || 1), total: materialTotal })

  // Fita de borda (m) — por peça, preço da fita cadastrada
  let fitaTotal = 0
  let fitaM = 0
  for (const p of result.pieces) {
    if (!p.edgeBandId) continue
    const price = catalog.fita[p.edgeBandId]
    if (price === undefined) continue
    const m = pieceEdgeBandMeters(p)
    fitaM += m
    fitaTotal += m * price
  }
  items.push({ label: 'Fita de borda', qty: fitaM, unit: 'm', unitPrice: fitaM > 0 ? fitaTotal / fitaM : 0, total: fitaTotal })

  // Ferragens
  const nDobradicas = result.hinges.length
  const nCorredicas = config.gavetas.quantidade * 2
  const corredicaPrice = (config.corredica && catalog.corredicas?.[String(config.corredica.medida)]) ?? catalog.corredica
  const tipoPuxador = config.puxador?.tipo ?? 'perfil_gola_anodizado'
  const nPuxadores = tipoPuxador === 'tip_on' ? 0 : config.portas.quantidade + config.gavetas.quantidade
  const puxadorPrice = catalog.puxadores?.[tipoPuxador] ?? catalog.puxador
  const nPistoes = result.pistons.length
  items.push({ label: 'Dobradiças', qty: nDobradicas, unit: 'un', unitPrice: catalog.dobradica, total: nDobradicas * catalog.dobradica })
  if (nCorredicas > 0) {
    items.push({ label: 'Corrediças', qty: nCorredicas, unit: 'un', unitPrice: corredicaPrice, total: nCorredicas * corredicaPrice })
  }
  if (nPuxadores > 0) {
    items.push({ label: 'Puxadores', qty: nPuxadores, unit: 'un', unitPrice: puxadorPrice, total: nPuxadores * puxadorPrice })
  }
  if (nPistoes > 0) {
    items.push({ label: 'Pistões a gás', qty: nPistoes, unit: 'un', unitPrice: catalog.pistao, total: nPistoes * catalog.pistao })
  }

  const total = items.reduce((s, i) => s + i.total, 0)
  return { items: items.filter((i) => i.total > 0), total }
}

/** Catálogo padrão (valores do seed do banco). Preços reais vêm do cadastro. */
export function defaultCatalog(): PriceCatalog {
  return {
    material: {
      mdf_branco_tx_15mm: 120,
      mdf_branco_tx_18mm: 135,
      mdf_maderado_x_18mm: 145,
      mdf_maderado_escuro_18mm: 150,
      mdf_preto_18mm: 155,
      mdf_cinza_18mm: 140,
    },
    fita: {
      fita_proadec_22mm_maderado_x: 3.5,
      fita_proadec_22mm_branco_tx: 2.5,
    },
    dobradica: 12,
    corredica: 18,
    corredicas: {
      '30': 15,
      '35': 17,
      '40': 18,
      '45': 20,
      '50': 22,
      '55': 24,
      '60': 26,
    },
    puxador: 20,
    puxadores: {
      perfil_gola_anodizado: 22,
      perfil_45_friso: 28,
      usinado_45: 18,
      passante: 15,
      alca_convencional: 30,
      facetado_rometal: 35,
      tip_on: 0,
    },
    pistao: 40,
  }
}
