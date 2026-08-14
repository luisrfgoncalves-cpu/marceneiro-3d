import { describe, it, expect } from 'vitest'
import { DEFAULT_RULES } from '../rules'
import { computeModule } from '../computeModule'
import { estimateCost, defaultCatalog } from '../cost'
import { armario2Portas, aereo2Portas, torre, guardaRoupa4Portas } from '../templates'

describe('Caixaria base+chapéu passam (Seção 6.1)', () => {
  it('armário tem base e chapéu com a largura total', () => {
    const result = computeModule(armario2Portas({ largura: 1200 }), DEFAULT_RULES)
    const base = result.pieces.find((p) => p.name === 'Base')
    const chapeu = result.pieces.find((p) => p.name === 'Chapéu')
    expect(base?.w).toBe(1200)
    expect(chapeu?.w).toBe(1200)
    expect(base?.position.y).toBe(100) // sobre o rodapé
    expect(chapeu?.position.y).toBe(850 - 18) // altura - ec
    expect(result.hinges.length).toBe(6) // 2 portas × 3
  })

  it('aéreo não tem rodapé e tem base passando', () => {
    const result = computeModule(aereo2Portas(), DEFAULT_RULES)
    expect(result.pieces.some((p) => p.name === 'Rodapé')).toBe(false)
    expect(result.pieces.find((p) => p.name === 'Base')?.w).toBe(800)
  })

  it('torre tem 3 prateleiras e 2 portas', () => {
    const result = computeModule(torre(), DEFAULT_RULES)
    const prateleiras = result.pieces.filter((p) => p.name.startsWith('Prateleira'))
    expect(prateleiras).toHaveLength(3)
    expect(result.hinges.length).toBe(10) // 2 portas × 5
  })

  it('guarda-roupa 4 portas tem 4 portas casal', () => {
    const result = computeModule(guardaRoupa4Portas(), DEFAULT_RULES)
    const portas = result.pieces.filter((p) => p.name.startsWith('Porta'))
    expect(portas).toHaveLength(4)
    // casal: 1ª e última dobradiça a 10cm, intermediciária dividida
    expect(result.hinges.length).toBe(12)
  })
})

describe('Porta basculante + pistões (Seção 5.8/4.4)', () => {
  it('basculante empilhado gera pistões e não dobrideiras', () => {
    const cfg = armario2Portas({ portas: { quantidade: 2, tipo: 'basculante', abrePara: 'cima', pistao: true, dobradicasPorPorta: 3, espessura: 18 } })
    const result = computeModule(cfg, DEFAULT_RULES)
    expect(result.pistons.length).toBe(2) // 1 por porta
    expect(result.hinges.length).toBe(0)
  })

  it('basculante sem pistão gera apenas portas', () => {
    const cfg = armario2Portas({ portas: { quantidade: 1, tipo: 'basculante', abrePara: 'cima', pistao: false, dobradicasPorPorta: 0, espessura: 18 } })
    const result = computeModule(cfg, DEFAULT_RULES)
    expect(result.pistons.length).toBe(0)
    expect(result.pieces.some((p) => p.name.startsWith('Porta'))).toBe(true)
  })
})

describe('Junção entre módulos / montantes (Seção 5.9)', () => {
  it('montante deitado reduz a altura do vão da porta cobrindo o montante', () => {
    const cfg = armario2Portas({ montantes: { ativo: true, deitado: true, largura: 50, espessura: 18 } })
    const result = computeModule(cfg, DEFAULT_RULES)
    const montante = result.pieces.find((p) => p.name === 'Montante')
    expect(montante).toBeDefined()
    const porta = result.pieces.find((p) => p.name === 'Porta 1')
    expect(porta).toBeDefined()
    expect(porta!.position.y + porta!.h).toBeLessThanOrEqual(850)
  })

  it('montante de pé deixa 3cm à mostra e a porta remonta 2cm', () => {
    const cfg = armario2Portas({ montantes: { ativo: true, deitado: false, largura: 50, espessura: 18 } })
    const result = computeModule(cfg, DEFAULT_RULES)
    const porta = result.pieces.find((p) => p.name === 'Porta 1')!
    const chapeu = result.pieces.find((p) => p.name === 'Chapéu')!
    // 30mm do montante à mostra abaixo do chapéu
    const mostra = 30
    expect(chapeu.position.y - (porta.position.y + porta.h)).toBeCloseTo(mostra)
  })
})

describe('Fita por peça e puxador (Seção 3.2/4.3, 11.6)', () => {
  it('fita por peça: porta usa a fita configurada, não a padrão', () => {
    const result = computeModule(
      armario2Portas({ fitaBorda: 'fita_proadec_22mm_branco_tx', fitas: { porta: 'fita_proadec_35mm_maderado_x' } }),
      DEFAULT_RULES,
    )
    const porta = result.pieces.find((p) => p.name === 'Porta 1')!
    expect(porta.edgeBandId).toBe('fita_proadec_35mm_maderado_x')
    const base = result.pieces.find((p) => p.name === 'Base')!
    expect(base.edgeBandId).toBe('fita_proadec_22mm_branco_tx') // fallback
  })

  it('tip-on gera zero puxadores no orçamento', () => {
    const cfg = armario2Portas({ puxador: { tipo: 'tip_on', cor: 'preto' } })
    const result = computeModule(cfg, DEFAULT_RULES)
    const budget = estimateCost(cfg, result, defaultCatalog())
    expect(budget.items.some((i) => i.label === 'Puxadores')).toBe(false)
    expect(budget.items.some((i) => i.label === 'Dobradiças')).toBe(true)
  })

  it('puxador normal gera um puxador por porta', () => {
    const cfg = armario2Portas({ portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 }, gavetas: { quantidade: 0, sistema: 'telescopica', espessura: 15 } })
    const result = computeModule(cfg, DEFAULT_RULES)
    const budget = estimateCost(cfg, result, defaultCatalog())
    const pux = budget.items.find((i) => i.label === 'Puxadores')!
    expect(pux.qty).toBe(2)
  })
})
