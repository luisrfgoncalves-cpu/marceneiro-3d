import { describe, it, expect } from 'vitest'
import { DEFAULT_RULES } from './rules'
import {
  layoutEnvironment,
  moduleEffectiveWidth,
  detectCollisions,
  rotatePiece90,
  distributeEvenly,
  uid,
  type EnvironmentProject,
  type ModuleInstance,
} from './environment'
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

  it('largura efetiva do módulo girado usa a profundidade', () => {
    const cfg = balcao2Portas({ largura: 1000, profundidade: 600 })
    expect(moduleEffectiveWidth(cfg, true)).toBeCloseTo(600)
    expect(moduleEffectiveWidth(cfg)).toBeCloseTo(1000)
  })

  it('gapAntes cria vão entre módulos e totalWidth reflete', () => {
    const m1: ModuleInstance = { id: 'm1', nome: 'A', config: balcao2Portas({ largura: 600 }) }
    const m2: ModuleInstance = { id: 'm2', nome: 'B', config: balcao2Portas({ largura: 600 }), gapAntes: 50 }
    const { placed, totalWidth } = layoutEnvironment(project([m1, m2]), DEFAULT_RULES)
    expect(placed[1].offsetX).toBe(650)
    expect(totalWidth).toBe(1250)
  })

  it('módulo girado troca w/d das peças mantendo dentro do footprint', () => {
    const cfg = balcao2Portas({
      largura: 1000,
      profundidade: 600,
      tampo: { espessura: 0, pingadeiraFrente: 0, pingadeiraLados: 0 },
    })
    const m: ModuleInstance = { id: 'r1', nome: 'Girado', config: cfg, rotacionado: true }
    const { pieces, placed, totalWidth } = layoutEnvironment(project([m]), DEFAULT_RULES)

    expect(placed[0].width).toBe(600)
    expect(placed[0].depth).toBe(1000)
    expect(totalWidth).toBe(600)
    expect(pieces.length).toBeGreaterThan(0)
    for (const p of pieces) {
      expect(p.position.x + p.w, `peça ${p.name} x=${p.position.x} w=${p.w}`).toBeLessThanOrEqual(601)
      expect(p.position.z + p.d).toBeLessThanOrEqual(1001)
      expect(p.position.x).toBeGreaterThanOrEqual(-1)
    }
  })

  it('rotatePiece90 preserva volume e centraliza', () => {
    const piece = {
      id: 'x',
      name: 'Lateral esquerda',
      w: 18,
      h: 720,
      d: 560,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      materialId: 'm',
      edgeBandId: null,
      grainDirection: 'vertical' as const,
      edgeBanding: { top: false, bottom: false, left: false, right: false },
    }
    const r = rotatePiece90(piece, 1000, 600)
    expect(r.w).toBe(560)
    expect(r.d).toBe(18)
    expect(r.h).toBe(720)
    // footprint girado: 600 de largura × 1000 de profundidade.
    // centro original (9, 280) → girado (300 + pcz, 500 - pcx) = (280, 991)
    expect(r.position.x).toBe(280 - 560 / 2)
    expect(r.position.z).toBe(991 - 18 / 2)
    expect(r.position.x).toBeGreaterThanOrEqual(0)
    expect(r.position.z).toBeGreaterThanOrEqual(0)
  })

  it('detectCollisions aponta sobreposição com gap negativo e ignora encostados', () => {
    const m1: ModuleInstance = { id: 'a', nome: 'A', config: balcao2Portas({ largura: 800 }) }
    const m2: ModuleInstance = { id: 'b', nome: 'B', config: balcao2Portas({ largura: 600 }) }

    const ok = detectCollisions(project([m1, m2]), DEFAULT_RULES)
    expect(ok).toHaveLength(0)

    const sobreposto: ModuleInstance = { ...m2, gapAntes: -200 }
    const col = detectCollisions(project([m1, sobreposto]), DEFAULT_RULES)
    expect(col).toHaveLength(1)
    expect(col[0].aId).toBe('a')
    expect(col[0].bId).toBe('b')
    expect(col[0].overlapMm).toBeGreaterThanOrEqual(199)
  })

  it('posX explícito posiciona livre e colisão detecta sobreposição sem gap', () => {
    const m1: ModuleInstance = { id: 'a', nome: 'A', config: balcao2Portas({ largura: 800 }) }
    const m2: ModuleInstance = { id: 'b', nome: 'B', config: balcao2Portas({ largura: 600 }), posX: 400 }
    const { placed } = layoutEnvironment(project([m1, m2]), DEFAULT_RULES)
    expect(placed[1].offsetX).toBe(400)
    const col = detectCollisions(project([m1, m2]), DEFAULT_RULES)
    expect(col).toHaveLength(1)
  })

  it('posZ afasta o módulo da parede (peças transladadas em Z)', () => {
    const m: ModuleInstance = { id: 'z1', nome: 'Z', config: balcao2Portas({ largura: 600 }), posZ: 50 }
    const { pieces, placed } = layoutEnvironment(project([m]), DEFAULT_RULES)
    expect(placed[0].depth).toBeGreaterThan(0)
    for (const p of pieces) {
      expect(p.position.z).toBeGreaterThanOrEqual(50 - 0.5)
    }
  })

  it('distributeEvenly iguala vãos preservando extensão total', () => {
    const a: ModuleInstance = { id: 'a', nome: 'A', config: balcao2Portas({ largura: 600 }) }
    const b: ModuleInstance = { id: 'b', nome: 'B', config: balcao2Portas({ largura: 600 }), gapAntes: 100 }
    const c: ModuleInstance = { id: 'c', nome: 'C', config: balcao2Portas({ largura: 600 }), gapAntes: 20 }

    const antes = layoutEnvironment(project([a, b, c]), DEFAULT_RULES).totalWidth
    const distribuido = distributeEvenly([a, b, c])
    const depois = layoutEnvironment(project(distribuido), DEFAULT_RULES).totalWidth

    expect(depois).toBeCloseTo(antes, -1)
    expect(distribuido.every((m) => m.posX === undefined && m.posZ === undefined)).toBe(true)
    expect(distribuido[0].gapAntes ?? 0).toBe(0)
    expect(Math.abs((distribuido[1].gapAntes ?? 0) - (distribuido[2].gapAntes ?? 0))).toBeLessThanOrEqual(1)
  })

  it('encostar tudo (distributeEvenly em 2 módulos) zera gaps e posições', () => {
    const a: ModuleInstance = { id: 'a', nome: 'A', config: balcao2Portas({ largura: 600 }), posX: 300, posZ: 40 }
    const b: ModuleInstance = { id: 'b', nome: 'B', config: balcao2Portas({ largura: 600 }), gapAntes: 80 }
    const r = distributeEvenly([a, b])
    expect(r.map((m) => m.gapAntes ?? 0)).toEqual([0, 0])
    expect(r.every((m) => m.posX === undefined && m.posZ === undefined)).toBe(true)
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
