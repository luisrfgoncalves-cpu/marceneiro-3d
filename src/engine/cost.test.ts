import { describe, it, expect } from 'vitest'
import { DEFAULT_RULES } from './rules'
import { computeModule } from './computeModule'
import { defaultCatalog, estimateCost, pieceEdgeBandMeters, pieceSheetAreaM2 } from './cost'
import { balcao2Portas, balcao2Portas2Gavetas } from './templates'
import type { Piece } from './types'

const porta: Piece = {
  id: 'p',
  name: 'Porta 1',
  w: 578,
  h: 697,
  d: 18,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  materialId: 'mdf_maderado_x_18mm',
  edgeBandId: null,
  grainDirection: 'vertical',
  edgeBanding: { top: true, bottom: true, left: true, right: true },
}

describe('Orçamento instantâneo (Seção 11.6)', () => {
  it('material é cobrado pela área de chapa (m²)', () => {
    const area = pieceSheetAreaM2(porta)
    expect(area).toBeCloseTo((578 * 697) / 1_000_000)
  })

  it('fita é medida em metros lineares das faces bandeadas', () => {
    const m = pieceEdgeBandMeters(porta)
    expect(m).toBeCloseTo((2 * 578 + 2 * 697) / 1000)
  })

  it('balcão gera orçamento com material, fita e dobradiças', () => {
    const result = computeModule(balcao2Portas(), DEFAULT_RULES)
    const budget = estimateCost(balcao2Portas(), result, defaultCatalog())
    expect(budget.total).toBeGreaterThan(0)
    const dobradicas = budget.items.find((i) => i.label === 'Dobradiças')!
    expect(dobradicas.qty).toBe(6)
    expect(dobradicas.total).toBeCloseTo(72)
    expect(budget.items.some((i) => i.label === 'MDF/MDP')).toBe(true)
    expect(budget.items.some((i) => i.label === 'Fita de borda')).toBe(true)
  })

  it('gavetas adicionam corrediças e puxadores ao orçamento', () => {
    const cfg = balcao2Portas2Gavetas()
    const result = computeModule(cfg, DEFAULT_RULES)
    const budget = estimateCost(cfg, result, defaultCatalog())
    const corredicas = budget.items.find((i) => i.label === 'Corrediças')!
    expect(corredicas.qty).toBe(4) // 2 gavetas × 2
    const puxadores = budget.items.find((i) => i.label === 'Puxadores')!
    expect(puxadores.qty).toBe(4) // 2 portas + 2 gavetas
  })
})
