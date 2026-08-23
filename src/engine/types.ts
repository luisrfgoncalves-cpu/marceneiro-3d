// Tipos centrais do domÃ­nio â€” Motor ParamÃ©trico de Marcenaria
// Documento-fonte: spec v2.0 (SeÃ§Ãµes 8, 9)

export interface Vec3 {
  x: number
  y: number
  z: number
}

export type GrainDirection = 'vertical' | 'horizontal'

export interface Piece {
  id: string
  name: string
  // Dimensões em mm, ao longo de cada eixo:
  // w = largura (X), h = altura (Y), d = profundidade (Z)
  w: number
  h: number
  d: number
  // PosiÃ§Ã£o do canto inferior-traseiro-esquerdo da peça, em mm.
  // Origem do mÃ³dulo: piso, traseira, esquerda.
  position: Vec3
  // RotaÃ§Ã£o em graus (Euler) â€” para peÃ§as montadas em outra orientaÃ§Ã£o
  rotation: Vec3
  materialId: string
  edgeBandId: string | null
  grainDirection: GrainDirection
  // Puxador desta frente (portas/frentes de gaveta) — propagado da config pelo motor
  puxador?: { tipo: PuxadorTipo; cor: PuxadorCor }
  // faces que recebem fita de borda (top/bottom = eixo Y, left/right = eixo X)
  edgeBanding: {
    top: boolean
    bottom: boolean
    left: boolean
    right: boolean
  }
  cutouts?: Array<{
    type: 'cuba' | 'cooktop'
    w: number
    d: number
    position: Vec3
  }>
}

export interface Hinge {
  doorId: string
  yMm: number // posiÃ§Ã£o da dobradiÃ§a ao longo da altura da porta (mm do topo da porta)
  relocated: boolean // true se foi realocada automaticamente por conflito
}

export interface Piston {
  doorId: string
  yMm: number // posiÃ§Ã£o do pistÃ£o ao longo da altura da porta
}

export type WarningType =
  | 'chapa_excedida'
  | 'dobradica_conflito'
  | 'vão_insuficiente'
  | 'taponamento_ilegal'

export interface Warning {
  type: WarningType
  pieceName: string
  message: string
}

export interface ModuleResult {
  pieces: Piece[]
  hinges: Hinge[]
  pistons: Piston[]
  warnings: Warning[]
  dimensions: { width: number; height: number; depth: number }
}

export type Ambiente =
  | 'cozinha'
  | 'dormitorio'
  | 'banheiro'
  | 'area_servico'
  | 'sala'

export type SistemaFundo =
  | 'sem_fundo'
  | 'encaixado_recuado'
  | 'rebaixo_parafusado'
  | 'parafusado_tras'
  | 'fundo_espesso'

export type SistemaGaveta = 'telescopica' | 'invisivel'

export type TipoPorta = 'solteira' | 'casal' | 'basculante'

export type PortaAbrePara = 'cima' | 'baixo'

export type ModuloTipo = 'balcao' | 'gaveteiro' | 'aereo' | 'torre' | 'armario' | 'guarda_roupa' | 'home' | 'pia'

export type MontagemTipo = 'minifix' | 'vb36' | 'parafuso'
export type DobradicaTipo = 'reta' | 'curva' | 'super_curva'
export type CorredicaTipo = 'telescopica' | 'invisivel'

export type PuxadorTipo =
  | 'perfil_gola_anodizado'
  | 'perfil_45_friso'
  | 'usinado_45'
  | 'passante'
  | 'alca_convencional'
  | 'facetado_rometal'
  | 'tip_on'

export type PuxadorCor = 'prata' | 'preto' | 'bronze'

export interface TaponamentoLado {
  ativo: boolean
  avancao: number // mm de avanço frontal além do plano das portas
  espessura: number // 15 ou 18mm
}

export interface PecaOverride {
  espessura?: number;
  material?: string;
  recuo?: number;
  avanco?: number;
  fitas?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}

export interface ModuloConfig {
  moduloTipo: ModuloTipo
  ambiente: Ambiente
  nome?: string
  // DimensÃµes gerais em mm
  largura: number
  altura: number
  profundidade: number
  espessuraCaixa: number // laterais/base/chapéu
  materialInterno: string
  materialExterno: string
  fitaBorda: string
  // Fita de borda por peÃ§a (Seção 3.2) â€” fallback para fitaBorda quando ausente
  fitas?: {
    porta?: string
    prateleira?: string
    montante?: string
    fundo?: string
    topo?: string
  }

  portas: {
    quantidade: number
    tipo: TipoPorta
    dobradicasPorPorta: number
    espessura: number
    // Porta basculante (SeÃ§Ã£o 5.8)
    abrePara?: PortaAbrePara
    pistao?: boolean
  }

  gavetas: {
    quantidade: number
    sistema: SistemaGaveta
    espessura: number // 15 ou 18mm (invisível exige 15)
  }

  // Puxadores (SeÃ§Ã£o 4.3) â€” tipo tip_on = sem puxador fÃ­sico
  ferragens?: {
    montagem: MontagemTipo;
    dobradica: DobradicaTipo;
    corredica: CorredicaTipo;
  }
  
  pecasCustomizadas?: Record<string, PecaOverride>; // key is piece name (e.g. 'Lateral Esquerda')
  
  puxador?: { tipo: PuxadorTipo; cor: PuxadorCor }

  // CorrediÃ§a (SeÃ§Ã£o 4.2) â€” medida em cm (30..60)
  corredica?: { medida: number }

  sistemaFundo: SistemaFundo
  taponamento: { esquerda: TaponamentoLado; direita: TaponamentoLado }
  rodape: {
    ativo: boolean
    altura: number
    recuo: number // mm de recuo em relação Ã  frente
    material: 'mdf' | 'pedra'
  }
  tampo: {
    espessura: number
    pingadeiraFrente: number // 0 = rente
    pingadeiraLados: number // 0 = rente
    material?: 'mdf' | 'pedra'
    cuba?: {
      largura: number
      profundidade: number
      posX: number
      posZ: number
    }
    cooktop?: {
      largura: number
      profundidade: number
      posX: number
      posZ: number
    }
  }
  // Montante deitado (balcão/gabinete) opcional
  montantes: {
    ativo: boolean
    deitado: boolean
    largura: number
    espessura: number
  }
  orelhinha: { ativo: boolean; largura: number }
  prateleiras: { quantidade: number; espessura: number }
  // Sentido do veio global -- quando definido, sobrescreve o padrao do motor nas pecas estruturais
  veioGlobal?: GrainDirection
  sapateiras: { quantidade: number }
  pia?: {
    materialPedra: 'granito' | 'marmore' | 'quartzito' | 'silestone' | 'porcelana'
    espessuraPedra: number
    cuba?: { largura: number; profundidade: number; posX: number; quantidade: number }
    cooktop?: { largura: number; profundidade: number; posX: number }
    torneira?: { posX: number }
    areaSeca?: { largura: number }
  }
}

