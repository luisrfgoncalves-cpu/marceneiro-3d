import { describe, it, expect } from 'vitest'
import { buildAssemblyManual, moduleAssemblySteps, shareViewUrl } from './manual'
import { DEFAULT_RULES } from './rules'
import { computeModule } from './computeModule'
import { balcao2Portas, balcao2Portas2Gavetas, gaveteiroGuardaRoupa } from './templates'

describe('Manual de montagem', () => {
  it('ordena caixaria antes de gavetas antes de frentes/portas', () => {
    const result = computeModule(balcao2Portas2Gavetas({ largura: 800 }), DEFAULT_RULES)
    const steps = moduleAssemblySteps(result)
    const titulos = steps.map((s) => s.titulo)
    expect(titulos[0]).toContain('Caixaria')
    expect(titulos.indexOf('3. Caixas de gaveta')).toBeGreaterThan(titulos.indexOf('1. Caixaria'))
    for (const t of titulos) expect(t).toMatch(/^\d\./)
    // ordem numérica crescente
    const nums = titulos.map((t) => Number(t.split('.')[0]))
    for (let i = 1; i < nums.length; i++) expect(nums[i]).toBeGreaterThan(nums[i - 1])
  })

  it('inclui dobradiças e puxador no passo de portas quando há portas', () => {
    const result = computeModule(balcao2Portas({ largura: 900 }), DEFAULT_RULES)
    const portasStep = moduleAssemblySteps(result).find((s) => s.titulo.includes('Portas'))
    expect(portasStep).toBeDefined()
    const joined = portasStep!.itens.join(' | ')
    expect(joined).toContain('Dobradiças')
    expect(joined).toContain('Puxadores')
  })

  it('manual do ambiente cobre todos os módulos e soma peças', () => {
    const manual = buildAssemblyManual(
      {
        modulos: [
          { id: 'a', nome: 'Balcão', config: balcao2Portas({ largura: 700 }) },
          { id: 'b', nome: 'Gaveteiro', config: gaveteiroGuardaRoupa({ largura: 500 }) },
        ],
      },
      DEFAULT_RULES,
    )
    expect(manual.modulos.map((m) => m.modulo)).toEqual(['Balcão', 'Gaveteiro'])
    expect(manual.pecasTotal).toBeGreaterThan(0)
    for (const m of manual.modulos) expect(m.pecasTotal).toBe(m.steps.reduce((s, st) => s + st.itens.length, 0) || m.pecasTotal)
  })

  it('módulo sem peças não quebra o manual', () => {
    const steps = moduleAssemblySteps({
      pieces: [],
      hinges: [],
      pistons: [],
      warnings: [],
      dimensions: { width: 600, height: 720, depth: 580 },
    })
    expect(steps).toHaveLength(0)
  })

  it('shareViewUrl monta link ?view=', () => {
    expect(shareViewUrl('abc', 'https://x.com')).toBe('https://x.com/?view=abc')
  })
})
