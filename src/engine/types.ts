// Tipos centrais do domínio — Motor Paramétrico de Marcenaria
// Documento-fonte: spec v2.0 (Seções 8, 9)

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
  // Posição do canto inferior-traseiro-esquerdo da peça, em mm.
  // Origem do módulo: piso, traseira, esquerda.
  position: Vec3
  // Rotação em graus (Euler) — para peças montadas em outra orientação
  rotation: Vec3
  materialId: string
  edgeBandId: string | null
  grainDirection: GrainDirection
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
  yMm: number // posição da dobradiça ao longo da altura da porta (mm do topo da porta)
  relocated: boolean // true se foi realocada automaticamente por conflito
}

export interface Piston {
  doorId: string
  yMm: number // posição do pistão ao longo da altura da porta
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

export type ModuloTipo = 'balcao' | 'gaveteiro' | 'aereo' | 'torre' | 'armario' | 'guarda_roupa' | 'home'

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

export interface ModuloConfig {
  moduloTipo: ModuloTipo
  ambiente: Ambiente
  nome?: string
  // Dimensões gerais em mm
  largura: number
  altura: number
  profundidade: number
  espessuraCaixa: number // laterais/base/chapéu
  materialInterno: string
  materialExterno: string
  fitaBorda: string
  // Fita de borda por peça (Seção 3.2) — fallback para fitaBorda quando ausente
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
    // Porta basculante (Seção 5.8)
    abrePara?: PortaAbrePara
    pistao?: boolean
  }

  gavetas: {
    quantidade: number
    sistema: SistemaGaveta
    espessura: number // 15 ou 18mm (invisível exige 15)
  }

  // Puxadores (Seção 4.3) — tipo tip_on = sem puxador físico
  puxador?: { tipo: PuxadorTipo; cor: PuxadorCor }

  // Corrediça (Seção 4.2) — medida em cm (30..60)
  corredica?: { medida: number }

  sistemaFundo: SistemaFundo
  taponamento: { esquerda: TaponamentoLado; direita: TaponamentoLado }
  rodape: {
    ativo: boolean
    altura: number
    recuo: number // mm de recuo em relação à frente
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
  sapateiras: { quantidade: number }
}