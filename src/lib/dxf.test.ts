import { describe, it, expect } from 'vitest'
import { buildDxf, sanitizeLayer, moduleDxfRects } from './dxf'
import { DEFAULT_RULES } from '../engine/rules'
import { computeModule } from '../engine/computeModule'
import { balcao2Portas } from '../engine/templates'
import type { ModuloConfig } from '../engine/types'

function sampleConfig(): ModuloConfig {
  return balcao2Portas({ largura: 800 })
}

describe('Escritor DXF R12', () => {
  it('gera estrutura SECTION/ENTITIES/EOF válida', () => {
    const dxf = buildDxf([{ name: 'Lateral Esquerda', x: 0, y: 0, w: 18, h: 720 }])
    expect(dxf).toContain('SECTION')
    expect(dxf).toContain('ENTITIES')
    expect(dxf.trim().endsWith('EOF')).toBe(true)
    expect(dxf).toContain('AC1009')
  })

  it('desenha 4 LINEs por retângulo com coordenadas corretas', () => {
    const dxf = buildDxf([{ name: 'Base', x: 18, y: 100, w: 764, h: 18 }])
    const lines = dxf.split('\r\n')
    const countLine = lines.filter((l) => l === 'LINE').length
    expect(countLine).toBe(4)
    // vértice (18,100) presente como ponto inicial
    const i = lines.findIndex((l) => l === 'LINE')
    expect(lines[i + 2]).toBe('Base') // código 8 → valor da layer em i+2
    expect(lines[i + 4]).toBe('18') // 10 → x1
    expect(lines[i + 6]).toBe('100') // 20 → y1
  })

  it('emite TEXT por peça com cota LxH e layer sanitizada', () => {
    const dxf = buildDxf([
      { name: 'Porta 1', x: 0, y: 118, w: 380, h: 582 },
      { name: 'Fundo ção', x: 10, y: 10, w: 700, h: 6 },
    ])
    const lines = dxf.split('\r\n')
    const countText = lines.filter((l) => l === 'TEXT').length
    expect(countText).toBe(2)
    expect(dxf).toContain('380x582')
    expect(dxf).toContain('700x6')
    // layer ascii sem espaços/acentos
    expect(dxf).not.toContain('ção')
  })

  it('sanitizeLayer deduplica nomes iguais', () => {
    const used = new Set<string>()
    const a = sanitizeLayer('Prateleira', used)
    const b = sanitizeLayer('Prateleira', used)
    expect(a.toUpperCase()).not.toBe(b.toUpperCase())
    expect(b.endsWith('_2')).toBe(true)
  })

  it('moduleDxfRects projeta todas as peças do módulo em mm', () => {
    const result = computeModule(sampleConfig(), DEFAULT_RULES)
    const rects = moduleDxfRects(result)
    expect(rects.length).toBe(result.pieces.length)
    for (const r of rects) {
      expect(r.w).toBeGreaterThan(0)
      expect(r.h).toBeGreaterThan(0)
      expect(Number.isFinite(r.x)).toBe(true)
    }
  })
})
