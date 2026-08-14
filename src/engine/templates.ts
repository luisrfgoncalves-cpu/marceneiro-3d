// Fábricas de configurações de módulo — ponto de partida da Seção 11.2.
// Todo valor nasce dos padrões das Seções 3–9; o marceneiro apenas ajusta.
// Os valores de "regra" (folgas, rebaixos, dobradiça a 10cm) ficam no
// RuleStore e o motor os lê de lá — nunca aqui.

import type { ModuloConfig } from './types'

const MDF_BRANCO_15 = 'mdf_branco_tx_15mm'
const MDF_MADERADO_18 = 'mdf_maderado_x_18mm'
const FITA_MADERADO = 'fita_proadec_22mm_maderado_x'

export function balcao2Portas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    moduloTipo: 'balcao',
    ambiente: 'cozinha',
    nome: 'Balcão 2 portas',
    largura: 1200,
    altura: 850,
    profundidade: 580,
    espessuraCaixa: 18,
    materialInterno: MDF_BRANCO_15,
    materialExterno: MDF_MADERADO_18,
    fitaBorda: FITA_MADERADO,
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 3, espessura: 18 },
    gavetas: { quantidade: 0, sistema: 'telescopica', espessura: 15 },
    sistemaFundo: 'rebaixo_parafusado',
    taponamento: {
      esquerda: { ativo: false, avancao: 20, espessura: 18 },
      direita: { ativo: false, avancao: 20, espessura: 18 },
    },
    rodape: { ativo: true, altura: 100, recuo: 50, material: 'mdf' },
    tampo: { espessura: 30, pingadeiraFrente: 0, pingadeiraLados: 0 },
    montantes: { ativo: false, deitado: true, largura: 50, espessura: 18 },
    orelhinha: { ativo: false, largura: 30 },
    prateleiras: { quantidade: 0, espessura: 15 },
    sapateiras: { quantidade: 0 },
    ...overrides,
  }
}

export function balcao2Portas2Gavetas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return balcao2Portas({
    nome: 'Balcão 2 portas + 2 gavetas',
    gavetas: { quantidade: 2, sistema: 'telescopica', espessura: 15 },
    ...overrides,
  })
}

export function gaveteiroGuardaRoupa(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    moduloTipo: 'gaveteiro',
    ambiente: 'dormitorio',
    nome: 'Gaveteiro de guarda-roupa',
    largura: 500,
    altura: 1200,
    profundidade: 580,
    espessuraCaixa: 18,
    materialInterno: MDF_BRANCO_15,
    materialExterno: MDF_MADERADO_18,
    fitaBorda: FITA_MADERADO,
    portas: { quantidade: 0, tipo: 'solteira', dobradicasPorPorta: 0, espessura: 18 },
    gavetas: { quantidade: 4, sistema: 'telescopica', espessura: 15 },
    sistemaFundo: 'encaixado_recuado',
    taponamento: {
      esquerda: { ativo: false, avancao: 0, espessura: 18 },
      direita: { ativo: false, avancao: 0, espessura: 18 },
    },
    rodape: { ativo: false, altura: 0, recuo: 0, material: 'mdf' },
    tampo: { espessura: 18, pingadeiraFrente: 0, pingadeiraLados: 0 },
    montantes: { ativo: false, deitado: true, largura: 100, espessura: 18 },
    orelhinha: { ativo: false, largura: 30 },
    prateleiras: { quantidade: 1, espessura: 15 },
    sapateiras: { quantidade: 0 },
    ...overrides,
  }
}

export function armario2Portas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    moduloTipo: 'armario',
    ambiente: 'cozinha',
    nome: 'Armário 2 portas',
    largura: 1200,
    altura: 850,
    profundidade: 580,
    espessuraCaixa: 18,
    materialInterno: MDF_BRANCO_15,
    materialExterno: MDF_MADERADO_18,
    fitaBorda: FITA_MADERADO,
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 3, espessura: 18 },
    gavetas: { quantidade: 0, sistema: 'telescopica', espessura: 15 },
    sistemaFundo: 'encaixado_recuado',
    taponamento: {
      esquerda: { ativo: false, avancao: 20, espessura: 18 },
      direita: { ativo: false, avancao: 20, espessura: 18 },
    },
    rodape: { ativo: true, altura: 100, recuo: 50, material: 'mdf' },
    tampo: { espessura: 18, pingadeiraFrente: 0, pingadeiraLados: 0 },
    montantes: { ativo: false, deitado: true, largura: 50, espessura: 18 },
    orelhinha: { ativo: false, largura: 30 },
    prateleiras: { quantidade: 1, espessura: 15 },
    sapateiras: { quantidade: 0 },
    ...overrides,
  }
}

export function aereo2Portas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return armario2Portas({
    moduloTipo: 'aereo',
    ambiente: 'cozinha',
    nome: 'Aéreo 2 portas',
    largura: 800,
    altura: 700,
    profundidade: 350,
    rodape: { ativo: false, altura: 0, recuo: 0, material: 'mdf' },
    prateleiras: { quantidade: 1, espessura: 15 },
    ...overrides,
  })
}

export function torre(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return armario2Portas({
    moduloTipo: 'torre',
    ambiente: 'cozinha',
    nome: 'Torre',
    largura: 600,
    altura: 2200,
    profundidade: 580,
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 5, espessura: 18 },
    prateleiras: { quantidade: 3, espessura: 15 },
    ...overrides,
  })
}

export function guardaRoupa4Portas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return armario2Portas({
    moduloTipo: 'guarda_roupa',
    ambiente: 'dormitorio',
    nome: 'Guarda-roupa 4 portas',
    largura: 2000,
    altura: 2300,
    profundidade: 600,
    portas: { quantidade: 4, tipo: 'casal', dobradicasPorPorta: 3, espessura: 18 },
    rodape: { ativo: false, altura: 0, recuo: 0, material: 'mdf' },
    prateleiras: { quantidade: 2, espessura: 15 },
    ...overrides,
  })
}

export function homeRack(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    moduloTipo: 'home',
    ambiente: 'sala',
    nome: 'Home / Rack',
    largura: 1600,
    altura: 600,
    profundidade: 450,
    espessuraCaixa: 18,
    materialInterno: MDF_BRANCO_15,
    materialExterno: MDF_MADERADO_18,
    fitaBorda: FITA_MADERADO,
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    gavetas: { quantidade: 0, sistema: 'telescopica', espessura: 15 },
    sistemaFundo: 'sem_fundo',
    taponamento: {
      esquerda: { ativo: false, avancao: 0, espessura: 18 },
      direita: { ativo: false, avancao: 0, espessura: 18 },
    },
    rodape: { ativo: false, altura: 0, recuo: 0, material: 'mdf' },
    tampo: { espessura: 18, pingadeiraFrente: 0, pingadeiraLados: 0 },
    montantes: { ativo: false, deitado: true, largura: 50, espessura: 18 },
    orelhinha: { ativo: false, largura: 30 },
    prateleiras: { quantidade: 1, espessura: 15 },
    sapateiras: { quantidade: 0 },
    ...overrides,
  }
}

export interface ModuleTemplate {
  id: string
  nome: string
  descricao: string
  cria: () => ModuloConfig
}

export const MODULE_TEMPLATES: ModuleTemplate[] = [
  { id: 'balcao_2p', nome: 'Balcão 2 portas', descricao: 'Balcão com duas portas solteiras', cria: balcao2Portas },
  { id: 'balcao_2p_2g', nome: 'Balcão 2 portas + 2 gavetas', descricao: 'Balcão com gavetas na parte de cima', cria: balcao2Portas2Gavetas },
  { id: 'gaveteiro', nome: 'Gaveteiro de guarda-roupa', descricao: 'Gaveteiro com maleiro por cima', cria: gaveteiroGuardaRoupa },
  { id: 'armario_2p', nome: 'Armário 2 portas', descricao: 'Caixaria com base e chapéu passando', cria: armario2Portas },
  { id: 'aereo_2p', nome: 'Aéreo 2 portas', descricao: 'Armário suspenso, sem rodapé', cria: aereo2Portas },
  { id: 'torre', nome: 'Torre', descricao: 'Módulo alto com prateleiras', cria: torre },
  { id: 'guarda_roupa_4p', nome: 'Guarda-roupa 4 portas', descricao: 'Grande com portas casal', cria: guardaRoupa4Portas },
  { id: 'home_rack', nome: 'Home / Rack', descricao: 'Módulo para sala com configuração livre', cria: homeRack },
]
