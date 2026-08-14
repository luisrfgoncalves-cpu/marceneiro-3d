import { describe, it, expect } from 'vitest'
import { DEFAULT_RULES } from './rules'
import { layoutEnvironment, moduleEffectiveWidth, uid, type EnvironmentProject, type ModuleInstance } from './environment'
import { balcao2Portas, gaveteiroGuardaRoupa } from './templates'

function project(mods: ModuleInstance[]): Pick<EnvironmentProject, 'modulos'> {
  return { modulos: mods }
}

describe('Projeto por ambiente (Seção 11.7)', () => {
  it('posiciona módulos encostados lado a lado', () => {
    const m1: ModuleInstance = { id: 'm1', nome: 'Balcão 1', config: balcao2Portas({ largura: 1200 }) }
    const m2: ModuleInstance = { id: 'm2', nome: 'Balcão 2', config: balcao2Portas({ largura: 800 }) }
    const { pieces, placed, totalWidth } = layoutEnvironment(project([m1, m2]), DEFAULT_RULES)

    expect(placed).toHaveLength(2)
    expect(placed[0].offsetX).toBe(0)
    expect(placed[1].offsetX).toBeCloseTo(1200)
    expect(totalWidth).toBeCloseTo(2000)

    const laterais1 = pieces.filter((p) => p.moduleId === 'm1' && p.name === 'Lateral esquerda')
    const laterais2 = pieces.filter((p) => p.moduleId === 'm2' && p.name === 'Lateral esquerda')
    expect(laterais1[0].position.x).toBe(0)
    expect(laterais2[0].position.x).toBeCloseTo(1200)
  })

  it('largura efetiva considera a pingadeira lateral do tampo', () => {
    const cfg = balcao2Portas({ largura: 1000, tampo: { espessura: 30, pingadeiraFrente: 0, pingadeiraLados: 40 } })
    expect(moduleEffectiveWidth(cfg)).toBeCloseTo(1080)
  })

  it('envia peças de todos os módulos, com offset corretos', () => {
    const m1: ModuleInstance = { id: 'a', nome: 'Balcão', config: balcao2Portas({ largura: 1200 }) }
    const m2: ModuleInstance = { id: 'b', nome: 'Gaveteiro', config: gaveteiroGuardaRoupa({ largura: 500 }) }
    const { pieces, totalWidth } = layoutEnvironment(project([m1, m2]), DEFAULT_RULES)
    expect(pieces.some((p) => p.moduleId === 'a')).toBe(true)
    expect(pieces.some((p) => p.moduleId === 'b')).toBe(true)
    expect(totalWidth).toBeCloseTo(1700)
  })

  it('módulo com tamanho inválido não quebra o layout (sanitize)', () => {
    const m1: ModuleInstance = { id: 'c', nome: 'Inválido', config: balcao2Portas({ largura: 5, altura: -100 }) }
    const { pieces } = layoutEnvironment(project([m1]), DEFAULT_RULES)
    expect(pieces.length).toBeGreaterThan(0)
    for (const p of pieces) {
      expect(Number.isFinite(p.w)).toBe(true)
      expect(Number.isFinite(p.position.x)).toBe(true)
      expect(p.w).toBeGreaterThan(0)
      expect(p.h).toBeGreaterThan(0)
    }
  })
})

describe('Utilidades de ambiente', () => {
  it('gera ids únicos', () => {
    const a = uid()
    const b = uid()
    expect(a).not.toBe(b)
    expect(a.length).toBeGreaterThan(0)
  })
})
