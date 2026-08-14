// Regras do domínio — padrão de configurabilidade da Seção 2 da spec.
// Todo valor normativo do documento vira uma regra aqui, com o padrão
// valor_padrao / editavel / valor_customizado / unidade.
// O motor NUNCA lê número fixo — sempre resolve via estas regras.

export type RuleKey =
  // Fundo (Seção 5.1)
  | 'fundo.espessuraPadrao'
  | 'fundo.rebaixoProfundidade'
  | 'fundo.rebaixoEspaco'
  | 'fundo.espessuraEspesso'
  // Gaveta (Seção 5.2)
  | 'gaveta.contraRecuo'
  | 'gaveta.rebaixoProfundidade'
  | 'gaveta.rebaixoEspaco'
  | 'gaveta.rasgoProfundidade'
  | 'gaveta.rasgoLargura'
  | 'gaveta.alturaPadrao'
  | 'gaveta.frenteAltura'
  | 'gaveta.frenteGap'
  | 'gaveta.espessuraLateral'
  | 'gaveta.frenteEspessura'
  | 'gaveta.fundoEspessura'
  | 'gaveta.recuoTrilho'
  // Vãos entre portas/frentes (Seção 5.8)
  | 'vao.frenteVertical'
  | 'vao.casalVertical'
  | 'vao.horizontal'
  | 'porta.gapLateral'
  | 'porta.gapTampo'
  // Junção entre módulos vizinhos / montante (Seção 5.9)
  | 'porta.remonteMontanteDeitado'
  | 'porta.remonteMontanteDePe'
  | 'montante.mostraDePe'
  // Taponamento (Seção 5.3)
  | 'taponamento.overlap'
  // Dobradiças (Seção 4.1)
  | 'dobradica.pontaDistancia'
  | 'dobradica.copoDistanciaBorda'
  | 'dobradica.copoDiametro'
  | 'dobradica.toleranciaConflito'
  // Montantes do gaveteiro (Seção 6.2)
  | 'montante.gaveteiroLargura'
  | 'montante.espessura'
  | 'orelhinha.largura'
  | 'frente.embutidaMontante'
  // Tampo (Seção 5.4)
  | 'tampo.espessuraPadrao'
  | 'rodape.alturaPadrao'
  | 'rodape.espessuraPadrao'
  // Prateleiras (Seção 5.6)
  | 'prateleira.folga'
  | 'prateleira.cantoneiraRecuo'
  // Chapa padrão (Seção 5.10)
  | 'chapa.larguraMax'
  | 'chapa.alturaMax'
  // Maleiro / sapateira (Seção 6.2)
  | 'maleiro.frenteAltura'
  | 'maleiro.frenteEspessura'
  | 'sapateira.frenteAltura'

export interface RuleConfig {
  key: RuleKey
  valor_padrao: number
  editavel: boolean
  valor_customizado: number | null
  unidade: 'mm' | 'cm' | 'un'
  descricao: string
}

// Valores normativos extraídos das Seções 3–9 da spec.
// Único valor não-editável do sistema: fundo padrão 6mm (Seção 3.1).
export const RULE_DEFAULTS: RuleConfig[] = [
  { key: 'fundo.espessuraPadrao', valor_padrao: 6, editavel: false, valor_customizado: null, unidade: 'mm', descricao: 'Fundo padrão de armário — sempre 6mm, Branco TX (Seção 3.1)' },
  { key: 'fundo.rebaixoProfundidade', valor_padrao: 7, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Rebaixo do fundo parafusado (Seção 5.1)' },
  { key: 'fundo.rebaixoEspaco', valor_padrao: 1.3, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espaço do rebaixo do fundo (Seção 5.1)' },
  { key: 'fundo.espessuraEspesso', valor_padrao: 18, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Fundo espesso à mostra (Seção 5.1)' },

  { key: 'gaveta.contraRecuo', valor_padrao: 5, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Contra-frente/contra-fundo recuadas (Seção 5.2)' },
  { key: 'gaveta.rebaixoProfundidade', valor_padrao: 7, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Rebaixo nas laterais da gaveta telescópica (Seção 5.2)' },
  { key: 'gaveta.rebaixoEspaco', valor_padrao: 1.3, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espaço do rebaixo da gaveta (Seção 5.2)' },
  { key: 'gaveta.rasgoProfundidade', valor_padrao: 7, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Rasgo do fundo em gaveta invisível (Seção 5.2)' },
  { key: 'gaveta.rasgoLargura', valor_padrao: 1.3, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Largura do rasgo em gaveta invisível (Seção 5.2)' },
  { key: 'gaveta.alturaPadrao', valor_padrao: 140, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Altura padrão da gaveta (Seção 6.2)' },
  { key: 'gaveta.frenteAltura', valor_padrao: 155, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Altura da frente da gaveta (Seção 6.2)' },
  { key: 'gaveta.frenteGap', valor_padrao: 30, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espaçamento entre frentes de gaveta (Seção 6.2)' },
  { key: 'gaveta.espessuraLateral', valor_padrao: 15, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espessura da lateral da gaveta (Seção 5.2)' },
  { key: 'gaveta.frenteEspessura', valor_padrao: 18, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espessura da frente da gaveta' },
  { key: 'gaveta.fundoEspessura', valor_padrao: 6, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espessura do fundo da gaveta (Seção 5.2)' },
  { key: 'gaveta.recuoTrilho', valor_padrao: 30, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Recuo da corrediça na profundidade da gaveta (Seção 4.2)' },
  { key: 'taponamento.overlap', valor_padrao: 60, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Sobreposição do taponamento sobre a lateral (Seção 5.3)' },

  { key: 'vao.frenteVertical', valor_padrao: 4, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Vão entre portas/frentes fechadas (Seção 5.8)' },
  { key: 'vao.casalVertical', valor_padrao: 3, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Vão entre portas casal (Seção 5.8)' },
  { key: 'vao.horizontal', valor_padrao: 3, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Vão horizontal entre frentes (Seção 5.8)' },
  { key: 'porta.gapLateral', valor_padrao: 2, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Vão entre porta e lateral (padrão configurável)' },
  { key: 'porta.gapTampo', valor_padrao: 5, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Vão entre a peça e o tampo/pedra (Seção 5.9)' },
  { key: 'porta.remonteMontanteDeitado', valor_padrao: 13, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Porta remonta sobre montante deitado (Seção 5.9)' },
  { key: 'porta.remonteMontanteDePe', valor_padrao: 20, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Porta/frente remonta sobre montante de pé (Seção 5.9)' },
  { key: 'montante.mostraDePe', valor_padrao: 30, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Montante de pé à mostra abaixo da porta (Seção 5.9)' },

  { key: 'dobradica.pontaDistancia', valor_padrao: 100, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Primeira/última dobradiça a 10cm das pontas (Seção 4.1)' },
  { key: 'dobradica.copoDistanciaBorda', valor_padrao: 21.5, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Furo do copo até a borda da porta (Seção 4.1)' },
  { key: 'dobradica.copoDiametro', valor_padrao: 35, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Diâmetro do copo (Seção 4.1)' },
  { key: 'dobradica.toleranciaConflito', valor_padrao: 40, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Tolerância para detectar conflito com prateleira (Seção 4.1)' },

  { key: 'montante.gaveteiroLargura', valor_padrao: 100, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Largura do montante do gaveteiro (Seção 6.2)' },
  { key: 'montante.espessura', valor_padrao: 18, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espessura do montante' },
  { key: 'orelhinha.largura', valor_padrao: 30, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Orelhinha lateral (Seção 6.2)' },
  { key: 'frente.embutidaMontante', valor_padrao: 6, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Frente de baixo embutida 6mm abaixo do montante (Seção 6.2)' },

  { key: 'tampo.espessuraPadrao', valor_padrao: 18, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espessura padrão do tampo (Seção 5.4)' },
  { key: 'rodape.alturaPadrao', valor_padrao: 100, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Altura padrão do rodapé (Seção 4.6)' },
  { key: 'rodape.espessuraPadrao', valor_padrao: 18, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espessura do rodapé MDF (Seção 4.6)' },

  { key: 'prateleira.folga', valor_padrao: 3, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Folga da prateleira no vão (Seção 5.6)' },
  { key: 'prateleira.cantoneiraRecuo', valor_padrao: 50, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Recuo da cantoneira zamac (Seção 4.10)' },

  { key: 'chapa.larguraMax', valor_padrao: 2750, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Maior lado da chapa padrão (Seção 5.10)' },
  { key: 'chapa.alturaMax', valor_padrao: 1830, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Menor lado da chapa padrão (Seção 5.10)' },

  { key: 'maleiro.frenteAltura', valor_padrao: 100, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Altura da prateleira/maleiro do gaveteiro (Seção 6.2)' },
  { key: 'maleiro.frenteEspessura', valor_padrao: 6, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Espessura da frente do maleiro (Seção 6.2 — "frente com 6mm")' },
  { key: 'sapateira.frenteAltura', valor_padrao: 45, editavel: true, valor_customizado: null, unidade: 'mm', descricao: 'Altura da frente da sapateira (Seção 6.2)' },
]

// Regras já resolvidas em números concretos, prontas para o motor.
export interface EngineRules {
  fundoEspessuraPadrao: number
  fundoRebaixoProfundidade: number
  fundoRebaixoEspaco: number
  fundoEspessuraEspesso: number
  gavetaContraRecuo: number
  gavetaRebaixoProfundidade: number
  gavetaRebaixoEspaco: number
  gavetaRasgoProfundidade: number
  gavetaRasgoLargura: number
  gavetaAlturaPadrao: number
  gavetaFrenteAltura: number
  gavetaFrenteGap: number
  gavetaEspessuraLateral: number
  gavetaFrenteEspessura: number
  gavetaFundoEspessura: number
  gavetaRecuoTrilho: number
  taponamentoOverlap: number
  vaoFrenteVertical: number
  vaoCasalVertical: number
  vaoHorizontal: number
  portaGapLateral: number
  portaGapTampo: number
  portaRemonteMontanteDeitado: number
  portaRemonteMontanteDePe: number
  montanteMostraDePe: number
  dobradicaPontaDistancia: number
  dobradicaCopoDistanciaBorda: number
  dobradicaCopoDiametro: number
  dobradicaToleranciaConflito: number
  montanteGaveteiroLargura: number
  montanteEspessura: number
  orelhinhaLargura: number
  frenteEmbutidaMontante: number
  tampoEspessuraPadrao: number
  rodapeAlturaPadrao: number
  rodapeEspessuraPadrao: number
  prateleiraFolga: number
  prateleiraCantoneiraRecuo: number
  chapaLarguraMax: number
  chapaAlturaMax: number
  maleiroFrenteAltura: number
  maleiroFrenteEspessura: number
  sapateiraFrenteAltura: number
}

export function resolveRules(store: Map<RuleKey, number>): EngineRules {
  const r = (key: RuleKey) => {
    const custom = store.get(key)
    if (custom !== undefined) return custom
    const def = RULE_DEFAULTS.find((d) => d.key === key)
    if (!def) throw new Error(`Regra não cadastrada: ${key}`)
    return def.valor_customizado ?? def.valor_padrao
  }
  return {
    fundoEspessuraPadrao: r('fundo.espessuraPadrao'),
    fundoRebaixoProfundidade: r('fundo.rebaixoProfundidade'),
    fundoRebaixoEspaco: r('fundo.rebaixoEspaco'),
    fundoEspessuraEspesso: r('fundo.espessuraEspesso'),
    gavetaContraRecuo: r('gaveta.contraRecuo'),
    gavetaRebaixoProfundidade: r('gaveta.rebaixoProfundidade'),
    gavetaRebaixoEspaco: r('gaveta.rebaixoEspaco'),
    gavetaRasgoProfundidade: r('gaveta.rasgoProfundidade'),
    gavetaRasgoLargura: r('gaveta.rasgoLargura'),
    gavetaAlturaPadrao: r('gaveta.alturaPadrao'),
    gavetaFrenteAltura: r('gaveta.frenteAltura'),
    gavetaFrenteGap: r('gaveta.frenteGap'),
    gavetaEspessuraLateral: r('gaveta.espessuraLateral'),
    gavetaFrenteEspessura: r('gaveta.frenteEspessura'),
    gavetaFundoEspessura: r('gaveta.fundoEspessura'),
    gavetaRecuoTrilho: r('gaveta.recuoTrilho'),
    taponamentoOverlap: r('taponamento.overlap'),
    vaoFrenteVertical: r('vao.frenteVertical'),
    vaoCasalVertical: r('vao.casalVertical'),
    vaoHorizontal: r('vao.horizontal'),
    portaGapLateral: r('porta.gapLateral'),
    portaGapTampo: r('porta.gapTampo'),
    portaRemonteMontanteDeitado: r('porta.remonteMontanteDeitado'),
    portaRemonteMontanteDePe: r('porta.remonteMontanteDePe'),
    montanteMostraDePe: r('montante.mostraDePe'),
    dobradicaPontaDistancia: r('dobradica.pontaDistancia'),
    dobradicaCopoDistanciaBorda: r('dobradica.copoDistanciaBorda'),
    dobradicaCopoDiametro: r('dobradica.copoDiametro'),
    dobradicaToleranciaConflito: r('dobradica.toleranciaConflito'),
    montanteGaveteiroLargura: r('montante.gaveteiroLargura'),
    montanteEspessura: r('montante.espessura'),
    orelhinhaLargura: r('orelhinha.largura'),
    frenteEmbutidaMontante: r('frente.embutidaMontante'),
    tampoEspessuraPadrao: r('tampo.espessuraPadrao'),
    rodapeAlturaPadrao: r('rodape.alturaPadrao'),
    rodapeEspessuraPadrao: r('rodape.espessuraPadrao'),
    prateleiraFolga: r('prateleira.folga'),
    prateleiraCantoneiraRecuo: r('prateleira.cantoneiraRecuo'),
    chapaLarguraMax: r('chapa.larguraMax'),
    chapaAlturaMax: r('chapa.alturaMax'),
    maleiroFrenteAltura: r('maleiro.frenteAltura'),
    maleiroFrenteEspessura: r('maleiro.frenteEspessura'),
    sapateiraFrenteAltura: r('sapateira.frenteAltura'),
  }
}

export const DEFAULT_RULES = resolveRules(new Map())

export function toRuleMap(rules: EngineRules): Map<RuleKey, number> {
  const map = new Map<RuleKey, number>()
  ;(Object.keys(rules) as Array<keyof EngineRules>).forEach((k) => {
    const def = RULE_DEFAULTS.find((d) => camelToKey(d.key) === k)
    if (def) map.set(def.key, rules[k])
  })
  return map
}

function camelToKey(k: RuleKey): string {
  // inverso: 'fundo.espessuraPadrao' -> 'fundoEspessuraPadrao'
  const [prefix, rest] = k.split('.')
  return prefix + rest.charAt(0).toUpperCase() + rest.slice(1)
}
