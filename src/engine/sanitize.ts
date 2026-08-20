// Sanitização defensiva da configuração — o motor nunca deve crashar ou gerar
// peças com dimensões inválidas (negativas/NaN) por entrada fora da faixa.
// "à prova de erros": qualquer valor informado pelo marceneiro é normalizado.

import type { ModuloConfig, ModuloTipo } from './types'

const clamp = (v: number, min: number, max: number) =>
  Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min

const TIPOS_CAIXARIA: ModuloTipo[] = ['aereo', 'torre', 'armario', 'guarda_roupa']

export function sanitizeModule(cfg: ModuloConfig): ModuloConfig {
  const espessuraCaixa = clamp(cfg.espessuraCaixa, 6, 36)
  const largura = clamp(cfg.largura, 2 * espessuraCaixa + 40, 4000)
  const altura = clamp(cfg.altura, 200, 3000)
  const profundidade = clamp(cfg.profundidade, 80, 1200)

  const portas = {
    quantidade: Math.round(clamp(cfg.portas.quantidade, 0, 8)),
    tipo:
      cfg.portas.tipo === 'casal' || cfg.portas.tipo === 'basculante'
        ? cfg.portas.tipo
        : ('solteira' as const),
    abrePara: cfg.portas.abrePara === 'baixo' ? ('baixo' as const) : ('cima' as const),
    pistao: Boolean(cfg.portas.pistao),
    dobradicasPorPorta: Math.round(clamp(cfg.portas.dobradicasPorPorta, 0, 6)),
    espessura: clamp(cfg.portas.espessura, 6, 36),
  }

  const gavetas = {
    quantidade: Math.round(clamp(cfg.gavetas.quantidade, 0, 8)),
    sistema: cfg.gavetas.sistema === 'invisivel' ? 'invisivel' as const : 'telescopica' as const,
    espessura: cfg.gavetas.espessura === 18 ? 18 as const : 15 as const,
  }

  const rodape = {
    ativo: Boolean(cfg.rodape.ativo),
    altura: clamp(cfg.rodape.altura, 0, 300),
    recuo: clamp(cfg.rodape.recuo, 0, profundidade),
    material: cfg.rodape.material === 'pedra' ? 'pedra' as const : 'mdf' as const,
  }

  const tampo = {
    espessura: clamp(cfg.tampo.espessura, 0, 60),
    pingadeiraFrente: clamp(cfg.tampo.pingadeiraFrente, 0, 200),
    pingadeiraLados: clamp(cfg.tampo.pingadeiraLados, 0, 200),
  }

  const taponamento = {
    esquerda: {
      ativo: Boolean(cfg.taponamento.esquerda.ativo),
      avancao: clamp(cfg.taponamento.esquerda.avancao, 0, 300),
      espessura: cfg.taponamento.esquerda.espessura === 15 ? 15 as const : 18 as const,
    },
    direita: {
      ativo: Boolean(cfg.taponamento.direita.ativo),
      avancao: clamp(cfg.taponamento.direita.avancao, 0, 300),
      espessura: cfg.taponamento.direita.espessura === 15 ? 15 as const : 18 as const,
    },
  }

  const orelhinha = {
    ativo: Boolean(cfg.orelhinha.ativo),
    largura: clamp(cfg.orelhinha.largura, 0, 200),
  }

  const montantes = {
    ativo: Boolean(cfg.montantes.ativo),
    deitado: Boolean(cfg.montantes.deitado),
    largura: clamp(cfg.montantes.largura, 20, 360),
    espessura: clamp(cfg.montantes.espessura, 6, 36),
  }

  return {
    ...cfg,
    moduloTipo: TIPOS_CAIXARIA.includes(cfg.moduloTipo)
      ? cfg.moduloTipo
      : cfg.moduloTipo === 'gaveteiro'
        ? ('gaveteiro' as const)
        : cfg.moduloTipo === 'home'
          ? ('home' as const)
          : cfg.moduloTipo === 'pia'
            ? ('pia' as const)
            : ('balcao' as const),
    largura,
    altura,
    profundidade,
    espessuraCaixa,
    portas,
    gavetas,
    puxador: cfg.puxador ?? { tipo: 'perfil_gola_anodizado', cor: 'preto' },
    corredica: cfg.corredica ?? { medida: 45 },
    fitas: cfg.fitas ?? {},
    rodape,
    tampo,
    taponamento,
    orelhinha,
    montantes,
    prateleiras: {
      quantidade: Math.round(clamp(cfg.prateleiras.quantidade, 0, 8)),
      espessura: clamp(cfg.prateleiras.espessura, 6, 36),
    },
    sapateiras: {
      quantidade: Math.round(clamp(cfg.sapateiras.quantidade, 0, 8)),
    },
  }
}
