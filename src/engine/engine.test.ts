import { describe, it, expect } from 'vitest'
import { DEFAULT_RULES } from './rules'
import { computeModule } from './computeModule'
import { computeHingeOffsets, resolveHingeConflicts } from './rules/dobradicas'
import { layoutDoors } from './rules/portas'
import { computeGavetaCaixa } from './rules/gaveta'
import { computeFundo } from './rules/fundo'
import { computeTaponamento } from './rules/taponamento'
import { balcao2Portas, balcao2Portas2Gavetas, gaveteiroGuardaRoupa } from './templates'
import type { Region } from './geometry'
import type { Hinge } from './types'

const interior: Region = { x: 18, y: 118, w: 1164, h: 702, z: 0, d: 580 }

describe('Portas e vãos (Seção 5.8)', () => {
  it('portas solteiras: vão de 4mm entre elas e 2mm nas laterais', () => {
    const doors = layoutDoors(interior, 2, 'solteira', DEFAULT_RULES)
    expect(doors).toHaveLength(2)
    expect(doors[0].w).toBeCloseTo(578)
    expect(doors[0].x).toBeCloseTo(20)
    expect(doors[1].x).toBeCloseTo(602)
    expect(doors[0].h).toBeCloseTo(697)
  })

  it('portas casal: vão de 3mm no ponto de encontro', () => {
    const doors = layoutDoors(interior, 2, 'casal', DEFAULT_RULES)
    const totalGaps = 2 * DEFAULT_RULES.portaGapLateral + DEFAULT_RULES.vaoCasalVertical
    expect(doors[0].w + doors[1].w + totalGaps).toBeCloseTo(interior.w)
    expect(doors[1].x - (doors[0].x + doors[0].w)).toBeCloseTo(DEFAULT_RULES.vaoCasalVertical)
  })

  it('soma das portas + vãos = largura do vão', () => {
    const doors = layoutDoors(interior, 3, 'solteira', DEFAULT_RULES)
    const total = doors.reduce((s, d) => s + d.w, 0) + 2 * DEFAULT_RULES.portaGapLateral + 2 * DEFAULT_RULES.vaoFrenteVertical
    expect(total).toBeCloseTo(interior.w)
  })
})

describe('Dobradiças (Seção 4.1)', () => {
  it('primeira e última a 10cm das pontas; demais divididas igualmente', () => {
    const hinges = computeHingeOffsets({ doorId: 'p', doorHeightMm: 697, doorTopY: 0, count: 3 }, DEFAULT_RULES)
    expect(hinges).toHaveLength(3)
    expect(hinges[0].yMm).toBeCloseTo(100)
    expect(hinges[2].yMm).toBeCloseTo(597)
    expect(hinges[1].yMm).toBeCloseTo(348.5)
  })

  it('com 2 dobradiças, ambas a 10cm das pontas', () => {
    const h = computeHingeOffsets({ doorId: 'p', doorHeightMm: 500, doorTopY: 0, count: 2 }, DEFAULT_RULES)
    expect(h[0].yMm).toBe(100)
    expect(h[1].yMm).toBe(400)
  })

  it('realoca automaticamente dobradiça que coincide com prateleira', () => {
    const hinges: Hinge[] = [
      { doorId: 'p', yMm: 100, relocated: false },
      { doorId: 'p', yMm: 348.5, relocated: false },
      { doorId: 'p', yMm: 597, relocated: false },
    ]
    const res = resolveHingeConflicts(hinges, 118, [{ top: 500, bottom: 440 }], DEFAULT_RULES)
    expect(res.relocations).toBe(1)
    expect(res.hinges[1].relocated).toBe(true)
    expect(res.hinges[1].yMm).toBeCloseTo(282)
  })
})

describe('Sistemas de fundo (Seção 5.1)', () => {
  it('encaixado recuado: 6mm entre laterais', () => {
    const p = computeFundo('encaixado_recuado', interior, 18, 'm', DEFAULT_RULES)
    expect(p[0].w).toBe(interior.w)
    expect(p[0].d).toBe(6)
    expect(p[0].position.z).toBe(0)
  })
  it('rebaixo parafusado: fundo recuado no rebaixo', () => {
    const p = computeFundo('rebaixo_parafusado', interior, 18, 'm', DEFAULT_RULES)
    expect(p[0].position.z).toBe(DEFAULT_RULES.fundoRebaixoProfundidade)
  })
  it('parafusado por trás: cobre a largura total', () => {
    const p = computeFundo('parafusado_tras', interior, 18, 'm', DEFAULT_RULES)
    expect(p[0].w).toBe(interior.w + 36)
    expect(p[0].position.x).toBe(0)
  })
  it('fundo espesso: 18mm à mostra', () => {
    const p = computeFundo('fundo_espesso', interior, 18, 'm', DEFAULT_RULES)
    expect(p[0].d).toBe(DEFAULT_RULES.fundoEspessuraEspesso)
  })
  it('sem fundo: nenhuma peça', () => {
    expect(computeFundo('sem_fundo', interior, 18, 'm', DEFAULT_RULES)).toHaveLength(0)
  })
})

describe('Sistema de gaveta (Seção 5.2)', () => {
  it('contra-frente e contra-fundo recuados 5mm; fundo parafusado entre eles', () => {
    const g = computeGavetaCaixa(
      { x: 18, y: 100, z: 0, largura: 1164, profundidade: 550, altura: 140 },
      'm',
      DEFAULT_RULES,
    )
    expect(g).toHaveLength(5)
    const contraFrente = g.find((p) => p.name === 'Gaveta contra-frente')!
    const contraFundo = g.find((p) => p.name === 'Gaveta contra-fundo')!
    expect(contraFrente.position.z + contraFrente.d).toBeCloseTo(550 - DEFAULT_RULES.gavetaContraRecuo)
    expect(contraFundo.position.z).toBe(DEFAULT_RULES.gavetaContraRecuo)
    expect(g.filter((p) => p.name.startsWith('Gaveta lateral'))).toHaveLength(2)
  })
})

describe('Taponamento (Seção 5.3)', () => {
  it('só nas laterais, com avanço frontal configurável', () => {
    const p = computeTaponamento(
      { lado: { ativo: true, avancao: 20, espessura: 18 }, side: 'esquerda', moduleWidth: 1200, moduleDepth: 580, height: 700, y: 118, materialId: 'm' },
      DEFAULT_RULES,
    )
    expect(p).toHaveLength(1)
    expect(p[0].position.x).toBe(0)
    expect(p[0].position.z + p[0].d).toBeCloseTo(580 + 20)
  })
  it('lado inativo não gera peça', () => {
    const p = computeTaponamento(
      { lado: { ativo: false, avancao: 20, espessura: 18 }, side: 'direita', moduleWidth: 1200, moduleDepth: 580, height: 700, y: 118, materialId: 'm' },
      DEFAULT_RULES,
    )
    expect(p).toHaveLength(0)
  })
})

describe('Módulo Balcão (Seção 9 — fórmulas relativas)', () => {
  it('calcula base, laterais, tampo e portas pelas fórmulas', () => {
    const res = computeModule(balcao2Portas(), DEFAULT_RULES)
    const base = res.pieces.find((p) => p.name === 'Base')!
    const lateral = res.pieces.find((p) => p.name === 'Lateral esquerda')!
    const portas = res.pieces.filter((p) => p.name.startsWith('Porta'))
    expect(base.w).toBeCloseTo(1200 - 2 * 18)
    expect(lateral.h).toBeCloseTo(850 - 100 - 18 - 30)
    expect(portas).toHaveLength(2)
    expect(res.hinges).toHaveLength(6) // 2 portas × 3 dobradiças
  })

  it('com gavetas, portas ficam na faixa inferior', () => {
    const res = computeModule(balcao2Portas2Gavetas(), DEFAULT_RULES)
    expect(res.pieces.filter((p) => p.name.startsWith('Frente gaveta'))).toHaveLength(2)
    expect(res.pieces.filter((p) => p.name.startsWith('Porta'))).toHaveLength(2)
  })
})

describe('Módulo Gaveteiro (Seção 6.2)', () => {
  it('monta caixa, montantes de 10cm, frentes de gaveta e maleiro', () => {
    const res = computeModule(gaveteiroGuardaRoupa(), DEFAULT_RULES)
    const nomes = res.pieces.map((p) => p.name)
    expect(nomes).toContain('Montante inferior (frente)')
    expect(nomes).toContain('Montante superior (frente)')
    expect(nomes).toContain('Montante traseiro')
    expect(res.pieces.filter((p) => p.name.startsWith('Frente gaveta'))).toHaveLength(4)
    expect(nomes).toContain('Frente maleiro')
  })
})

describe('Áreas molhadas (Seção 6.3)', () => {
  it('banheiro: gabinete gerado sem fundo', () => {
    const res = computeModule(balcao2Portas({ ambiente: 'banheiro' }), DEFAULT_RULES)
    expect(res.pieces.find((p) => p.name === 'Fundo')).toBeUndefined()
  })
})

describe('Limite de chapa (Seção 5.10)', () => {
  it('alerta quando uma peça excede a chapa padrão', () => {
    const res = computeModule(balcao2Portas({ largura: 3000 }), DEFAULT_RULES)
    expect(res.warnings.some((w) => w.type === 'chapa_excedida')).toBe(true)
  })
})
