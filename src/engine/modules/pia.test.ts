import { describe, it, expect } from 'vitest'
import { DEFAULT_RULES } from '../rules'
import { computeModule } from '../computeModule'
import { piaPedra } from '../templates'

describe('Módulo Pia de Pedra (Prioridade 6)', () => {
  it('gera caixaria sem fundo por padrão e tampo de pedra com cutouts', () => {
    const config = piaPedra({
      largura: 1800,
      altura: 850,
      profundidade: 600,
      pia: {
        materialPedra: 'granito',
        espessuraPedra: 30,
        cuba: { largura: 560, profundidade: 430, posX: 100, quantidade: 1 },
      }
    })

    const result = computeModule(config, DEFAULT_RULES)

    // Caixa
    const base = result.pieces.find((p) => p.name === 'Base')
    const lateralEsq = result.pieces.find((p) => p.name === 'Lateral esquerda')
    const lateralDir = result.pieces.find((p) => p.name === 'Lateral direita')
    const tampoPedra = result.pieces.find((p) => p.name === 'Tampo de Pedra')

    expect(base).toBeDefined()
    expect(lateralEsq).toBeDefined()
    expect(lateralDir).toBeDefined()
    expect(tampoPedra).toBeDefined()

    // Sem fundo
    const fundo = result.pieces.find((p) => p.name === 'Fundo')
    expect(fundo).toBeUndefined()

    // Verificações de dimensões do tampo de pedra
    expect(tampoPedra?.w).toBe(1800) // pingadeira lado = 0
    expect(tampoPedra?.h).toBe(30)   // espessura da pedra
    expect(tampoPedra?.d).toBe(620)  // profundidade + 20mm pingadeira frente

    // Cutouts
    expect(tampoPedra?.cutouts).toBeDefined()
    expect(tampoPedra?.cutouts?.length).toBe(1)
    expect(tampoPedra?.cutouts?.[0].type).toBe('cuba')
    expect(tampoPedra?.cutouts?.[0].w).toBe(560)
    expect(tampoPedra?.cutouts?.[0].d).toBe(430)
  })

  it('suporta múltiplos cutouts se configurado cuba e cooktop', () => {
    const config = piaPedra({
      largura: 2000,
      pia: {
        materialPedra: 'silestone',
        espessuraPedra: 20,
        cuba: { largura: 500, profundidade: 400, posX: 100, quantidade: 1 },
        cooktop: { largura: 600, profundidade: 500, posX: 1000 }
      }
    })

    const result = computeModule(config, DEFAULT_RULES)
    const tampoPedra = result.pieces.find((p) => p.name === 'Tampo de Pedra')

    expect(tampoPedra?.cutouts?.length).toBe(2)
    const types = tampoPedra?.cutouts?.map(c => c.type)
    expect(types).toContain('cuba')
    expect(types).toContain('cooktop')
  })
})
