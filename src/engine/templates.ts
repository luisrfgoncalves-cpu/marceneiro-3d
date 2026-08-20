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

export function guardaRoupa2Portas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
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


export function piaPedra(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    moduloTipo: 'pia',
    ambiente: 'cozinha',
    nome: 'Pia de pedra',
    largura: 1800,
    altura: 850,
    profundidade: 600,
    espessuraCaixa: 18,
    materialInterno: MDF_BRANCO_15,
    materialExterno: MDF_MADERADO_18,
    fitaBorda: FITA_MADERADO,
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    gavetas: { quantidade: 0, sistema: 'telescopica', espessura: 15 },
    sistemaFundo: 'sem_fundo',
    taponamento: {
      esquerda: { ativo: false, avancao: 20, espessura: 18 },
      direita: { ativo: false, avancao: 20, espessura: 18 },
    },
    rodape: { ativo: true, altura: 100, recuo: 50, material: 'pedra' },
    tampo: { espessura: 30, pingadeiraFrente: 20, pingadeiraLados: 0, material: 'pedra' },
    montantes: { ativo: false, deitado: true, largura: 50, espessura: 18 },
    orelhinha: { ativo: false, largura: 30 },
    prateleiras: { quantidade: 0, espessura: 15 },
    sapateiras: { quantidade: 0 },
    pia: {
      materialPedra: 'granito',
      espessuraPedra: 30,
      cuba: { largura: 560, profundidade: 430, posX: 100, quantidade: 1 },
    },
    ...overrides,
  }
}


// ─── COZINHA ─────────────────────────────────────────────────────────────────

export function balcao1Porta(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return balcao2Portas({ nome: 'Balcão 1 porta', largura: 600, portas: { quantidade: 1, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 }, ...overrides })
}

export function balcao4Gavetas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...balcao2Portas({ nome: 'Gaveteiro de cozinha 4 gavetas', largura: 500 }),
    portas: { quantidade: 0, tipo: 'solteira', dobradicasPorPorta: 0, espessura: 18 },
    gavetas: { quantidade: 4, sistema: 'telescopica', espessura: 15 },
    ...overrides,
  }
}

export function balcaoPia(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return balcao2Portas({
    moduloTipo: 'balcao',
    nome: 'Balcão de pia',
    largura: 1000,
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    ...overrides,
  })
}

export function balcaoCantoL(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return balcao2Portas({
    nome: 'Canto L (Blind Corner)',
    largura: 900,
    profundidade: 880,
    portas: { quantidade: 1, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    ...overrides,
  })
}

export function balcaoCooktop(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return balcao2Portas({
    nome: 'Balcão com recorte cooktop',
    largura: 900,
    ...overrides,
  })
}

export function aereo1Porta(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return aereo2Portas({
    nome: 'Aéreo 1 porta',
    largura: 400,
    portas: { quantidade: 1, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    ...overrides,
  })
}

export function aereo3Portas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return aereo2Portas({
    nome: 'Aéreo 3 portas',
    largura: 1200,
    portas: { quantidade: 3, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    prateleiras: { quantidade: 2, espessura: 15 },
    ...overrides,
  })
}

export function aereoCanto(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return aereo2Portas({
    nome: 'Aéreo canto',
    largura: 900,
    profundidade: 350,
    portas: { quantidade: 1, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    ...overrides,
  })
}

export function torreForno(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return torre({
    nome: 'Torre com forno',
    largura: 600,
    altura: 2200,
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 3, espessura: 18 },
    prateleiras: { quantidade: 2, espessura: 15 },
    ...overrides,
  })
}

export function torreGeladeira(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return torre({
    nome: 'Torre geladeira',
    largura: 750,
    altura: 2400,
    portas: { quantidade: 0, tipo: 'solteira', dobradicasPorPorta: 0, espessura: 18 },
    prateleiras: { quantidade: 0, espessura: 15 },
    ...overrides,
  })
}

// ─── DORMITÓRIO ──────────────────────────────────────────────────────────────

export function guardaRoupa6Portas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return guardaRoupa2Portas({
    nome: 'Guarda-roupa 6 portas',
    largura: 2700,
    portas: { quantidade: 6, tipo: 'casal', dobradicasPorPorta: 3, espessura: 18 },
    prateleiras: { quantidade: 3, espessura: 15 },
    ...overrides,
  })
}

export function guardaRoupaCasal(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return guardaRoupa2Portas({
    nome: 'Guarda-roupa casal 4p + gavetas',
    largura: 2200,
    portas: { quantidade: 4, tipo: 'casal', dobradicasPorPorta: 3, espessura: 18 },
    gavetas: { quantidade: 3, sistema: 'telescopica', espessura: 15 },
    prateleiras: { quantidade: 2, espessura: 15 },
    ...overrides,
  })
}

export function comoda4Gavetas(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...balcao2Portas({ nome: 'Cômoda 4 gavetas', largura: 1000, altura: 900, profundidade: 450 }),
    moduloTipo: 'gaveteiro',
    ambiente: 'dormitorio',
    portas: { quantidade: 0, tipo: 'solteira', dobradicasPorPorta: 0, espessura: 18 },
    gavetas: { quantidade: 4, sistema: 'telescopica', espessura: 15 },
    rodape: { ativo: true, altura: 100, recuo: 50, material: 'mdf' },
    ...overrides,
  }
}

export function mesaDeCabeceira(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...balcao2Portas({ nome: 'Mesa de cabeceira', largura: 450, altura: 650, profundidade: 400 }),
    moduloTipo: 'armario',
    ambiente: 'dormitorio',
    portas: { quantidade: 1, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    gavetas: { quantidade: 1, sistema: 'telescopica', espessura: 15 },
    prateleiras: { quantidade: 0, espessura: 15 },
    rodape: { ativo: true, altura: 80, recuo: 30, material: 'mdf' },
    ...overrides,
  }
}

// ─── BANHEIRO ────────────────────────────────────────────────────────────────

export function gabineteRia(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...balcao2Portas({ nome: 'Gabinete com cuba (banheiro)', largura: 600, altura: 800, profundidade: 450 }),
    moduloTipo: 'balcao',
    ambiente: 'banheiro',
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    gavetas: { quantidade: 0, sistema: 'telescopica', espessura: 15 },
    rodape: { ativo: false, altura: 0, recuo: 0, material: 'mdf' },
    prateleiras: { quantidade: 1, espessura: 15 },
    ...overrides,
  }
}

export function espelheira(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...aereo2Portas({ nome: 'Espelheira', largura: 600, altura: 700, profundidade: 150 }),
    moduloTipo: 'aereo',
    ambiente: 'banheiro',
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    prateleiras: { quantidade: 2, espessura: 15 },
    ...overrides,
  }
}

export function armarioBanheiro(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...aereo2Portas({ nome: 'Armário aéreo banheiro', largura: 600, altura: 600, profundidade: 250 }),
    moduloTipo: 'aereo',
    ambiente: 'banheiro',
    portas: { quantidade: 1, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    prateleiras: { quantidade: 2, espessura: 15 },
    ...overrides,
  }
}

// ─── SALA / ESCRITÓRIO ───────────────────────────────────────────────────────

export function painelTv(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...homeRack({ nome: 'Painel de TV', largura: 2400, altura: 600, profundidade: 300 }),
    moduloTipo: 'home',
    ambiente: 'sala',
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    prateleiras: { quantidade: 1, espessura: 15 },
    ...overrides,
  }
}

export function estanteSala(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return {
    ...torre({ nome: 'Estante modular', largura: 1200, altura: 1800, profundidade: 350 }),
    moduloTipo: 'home',
    ambiente: 'sala',
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 2, espessura: 18 },
    prateleiras: { quantidade: 4, espessura: 15 },
    rodape: { ativo: true, altura: 80, recuo: 30, material: 'mdf' },
    ...overrides,
  }
}

export function bancadaEscritorio(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return balcao2Portas({
    nome: 'Bancada de escritório',
    largura: 1400,
    altura: 750,
    profundidade: 600,
    ambiente: 'sala',
    portas: { quantidade: 0, tipo: 'solteira', dobradicasPorPorta: 0, espessura: 18 },
    gavetas: { quantidade: 2, sistema: 'telescopica', espessura: 15 },
    prateleiras: { quantidade: 0, espessura: 15 },
    ...overrides,
  })
}

export function armarioEscritorio(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return torre({
    nome: 'Armário de escritório',
    largura: 800,
    altura: 2000,
    profundidade: 400,
    ambiente: 'sala',
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 3, espessura: 18 },
    prateleiras: { quantidade: 4, espessura: 15 },
    ...overrides,
  })
}

// ─── ÁREA DE SERVIÇO ─────────────────────────────────────────────────────────

export function armarioAreaServico(overrides: Partial<ModuloConfig> = {}): ModuloConfig {
  return torre({
    nome: 'Armário área de serviço',
    largura: 700,
    altura: 2200,
    profundidade: 550,
    ambiente: 'area_servico',
    portas: { quantidade: 2, tipo: 'solteira', dobradicasPorPorta: 4, espessura: 18 },
    prateleiras: { quantidade: 3, espessura: 15 },
    ...overrides,
  })
}


export interface ModuleTemplate {
  ambiente?: string
  id: string
  nome: string
  descricao: string
  cria: () => ModuloConfig
}

export const MODULE_TEMPLATES: ModuleTemplate[] = [
  // ─── COZINHA ───────────────────────────────────────────────────────────────
  { id: 'balcao_1p', nome: 'Balcão 1 porta', descricao: 'Balcão simples com 1 porta', ambiente: 'cozinha', cria: balcao1Porta },
  { id: 'balcao_2p', nome: 'Balcão 2 portas', descricao: 'Balcão com duas portas solteiras', ambiente: 'cozinha', cria: balcao2Portas },
  { id: 'balcao_2p_2g', nome: 'Balcão 2p + 2 gavetas', descricao: 'Balcão com gavetas na parte de cima', ambiente: 'cozinha', cria: balcao2Portas2Gavetas },
  { id: 'balcao_4g', nome: 'Gaveteiro cozinha', descricao: 'Balcão só com gavetas, sem portas', ambiente: 'cozinha', cria: balcao4Gavetas },
  { id: 'balcao_pia', nome: 'Balcão de pia', descricao: 'Para instalar pia de embutir', ambiente: 'cozinha', cria: balcaoPia },
  { id: 'balcao_cooktop', nome: 'Balcão cooktop', descricao: 'Com recorte para cooktop embutido', ambiente: 'cozinha', cria: balcaoCooktop },
  { id: 'balcao_canto_l', nome: 'Canto L', descricao: 'Módulo de canto blind corner', ambiente: 'cozinha', cria: balcaoCantoL },
  { id: 'aereo_1p', nome: 'Aéreo 1 porta', descricao: 'Armário suspenso pequeno', ambiente: 'cozinha', cria: aereo1Porta },
  { id: 'aereo_2p', nome: 'Aéreo 2 portas', descricao: 'Armário suspenso, sem rodapé', ambiente: 'cozinha', cria: aereo2Portas },
  { id: 'aereo_3p', nome: 'Aéreo 3 portas', descricao: 'Armário suspenso grande', ambiente: 'cozinha', cria: aereo3Portas },
  { id: 'aereo_canto', nome: 'Aéreo canto', descricao: 'Armário suspenso de canto', ambiente: 'cozinha', cria: aereoCanto },
  { id: 'torre', nome: 'Torre', descricao: 'Módulo alto com prateleiras', ambiente: 'cozinha', cria: torre },
  { id: 'torre_forno', nome: 'Torre forno', descricao: 'Torre para forno embutido', ambiente: 'cozinha', cria: torreForno },
  { id: 'torre_geladeira', nome: 'Torre geladeira', descricao: 'Coluna alta para geladeira', ambiente: 'cozinha', cria: torreGeladeira },
  { id: 'pia_pedra', nome: 'Pia de pedra', descricao: 'Bancada com tampo em granito/mármore e cuba embutida', ambiente: 'cozinha', cria: piaPedra },

  // ─── DORMITÓRIO ────────────────────────────────────────────────────────────
  { id: 'guarda_roupa_2p', nome: 'Guarda-roupa 2 portas', descricao: 'Tamanho padrão, 2 portas', ambiente: 'dormitorio', cria: guardaRoupa2Portas },
  { id: 'guarda_roupa_6p', nome: 'Guarda-roupa 6 portas', descricao: 'Grande, 6 portas com batente', ambiente: 'dormitorio', cria: guardaRoupa6Portas },
  { id: 'guarda_roupa_casal', nome: 'Guarda-roupa casal', descricao: '4 portas + gavetas internos', ambiente: 'dormitorio', cria: guardaRoupaCasal },
  { id: 'gaveteiro_gr', nome: 'Gaveteiro guarda-roupa', descricao: 'Gaveteiro com maleiro por cima', ambiente: 'dormitorio', cria: gaveteiroGuardaRoupa },
  { id: 'comoda_4g', nome: 'Cômoda 4 gavetas', descricao: 'Cômoda clássica com quatro gavetas', ambiente: 'dormitorio', cria: comoda4Gavetas },
  { id: 'mesa_cabeceira', nome: 'Mesa de cabeceira', descricao: 'Criado-mudo com porta e gaveta', ambiente: 'dormitorio', cria: mesaDeCabeceira },

  // ─── BANHEIRO ──────────────────────────────────────────────────────────────
  { id: 'gabinete_banheiro', nome: 'Gabinete com cuba', descricao: 'Balcão com cuba de embutir', ambiente: 'banheiro', cria: gabineteRia },
  { id: 'espelheira', nome: 'Espelheira', descricao: 'Armário com espelho na porta', ambiente: 'banheiro', cria: espelheira },
  { id: 'armario_banheiro', nome: 'Armário aéreo', descricao: 'Armário suspenso para banheiro', ambiente: 'banheiro', cria: armarioBanheiro },

  // ─── SALA / ESCRITÓRIO ─────────────────────────────────────────────────────
  { id: 'home_rack', nome: 'Home / Rack', descricao: 'Módulo baixo para sala', ambiente: 'sala', cria: homeRack },
  { id: 'painel_tv', nome: 'Painel de TV', descricao: 'Painel suspenso para TV', ambiente: 'sala', cria: painelTv },
  { id: 'estante_sala', nome: 'Estante modular', descricao: 'Estante alta com portas e prateleiras', ambiente: 'sala', cria: estanteSala },
  { id: 'bancada_escritorio', nome: 'Bancada escritório', descricao: 'Mesa com gaveteiro embutido', ambiente: 'sala', cria: bancadaEscritorio },
  { id: 'armario_escritorio', nome: 'Armário escritório', descricao: 'Armário alto para escritório', ambiente: 'sala', cria: armarioEscritorio },

  // ─── ÁREA DE SERVIÇO ───────────────────────────────────────────────────────
  { id: 'armario_area_servico', nome: 'Armário área de serviço', descricao: 'Coluna alta para área de serviço', ambiente: 'area_servico', cria: armarioAreaServico },
]
