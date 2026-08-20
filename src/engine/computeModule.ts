// Motor paramétrico — função pura (Seção 9).
// Recebe a config do módulo e as regras resolvidas; devolve a lista de peças
// com dimensão/posição final + dobradiças + avisos. Não depende de 3D.

import type { EngineRules } from './rules'
import { validate } from './validate'
import { sanitizeModule } from './sanitize'
import { computeBalcao } from './modules/balcao'
import { computeGaveteiro } from './modules/gaveteiro'
import { computeArmario } from './modules/armario'
import { computeHome } from './modules/home'
import type { Hinge, ModuloConfig, ModuleResult, Piece, Piston, SistemaFundo } from './types'

const AREAS_MOLHADAS = new Set(['banheiro', 'area_servico'])

function normalizarAmbiente(config: ModuloConfig): ModuloConfig {
  // Seção 6.3: gabinete em área molhada/lavanderia/banheiro é sempre sem fundo
  if (AREAS_MOLHADAS.has(config.ambiente)) {
    return { ...config, sistemaFundo: 'sem_fundo' as SistemaFundo }
  }
  return config
}

const TIPOS_CAIXARIA: ModuloConfig['moduloTipo'][] = ['aereo', 'torre', 'armario', 'guarda_roupa']

export function computeModule(config: ModuloConfig, rules: EngineRules): ModuleResult {
  const cfg = normalizarAmbiente(sanitizeModule(config))

  let pieces: Piece[] = []
  let hinges: Hinge[] = []
  let pistons: Piston[] = []
  let extraWarnings: ModuleResult['warnings'] = []

  if (cfg.moduloTipo === 'balcao') {
    const r = computeBalcao(cfg, rules)
    pieces = r.pieces
    hinges = r.hinges
    pistons = r.pistons
  } else if (cfg.moduloTipo === 'gaveteiro') {
    const r = computeGaveteiro(cfg, rules)
    pieces = r.pieces
    extraWarnings = r.warnings
  } else if (cfg.moduloTipo === 'home') {
    const r = computeHome(cfg, rules)
    pieces = r.pieces
    hinges = r.hinges
    pistons = r.pistons
  } else if (TIPOS_CAIXARIA.includes(cfg.moduloTipo)) {
    const r = computeArmario(cfg, rules)
    pieces = r.pieces
    hinges = r.hinges
    pistons = r.pistons
    extraWarnings = r.warnings
  }

  const piecesWithBand = applyEdgeBanding(pieces, config)
  const warnings = [...extraWarnings, ...validate(piecesWithBand, rules)]

  if (
    config.gavetas.quantidade > 0 &&
    config.gavetas.sistema === 'invisivel' &&
    config.gavetas.espessura !== 15
  ) {
    warnings.push({
      type: 'gaveta_invalida' as any,
      pieceName: 'Gavetas',
      message: 'A corrediça invisível (slow) exige gaveta com espessura de 15mm.',
    })
  }

  return {
    pieces: piecesWithBand,
    hinges,
    pistons,
    warnings,
    dimensions: { width: config.largura, height: config.altura, depth: config.profundidade },
  }
}

/** Papel da peça para seleção de fita independente (Seção 3.2). */
function pieceRole(name: string): 'porta' | 'prateleira' | 'montante' | 'fundo' | 'topo' | null {
  if (/porta|frente/i.test(name)) return 'porta'
  if (/prateleira|maleiro|sapateira/i.test(name)) return 'prateleira'
  if (/montante/i.test(name)) return 'montante'
  if (/fundo/i.test(name)) return 'fundo'
  if (/tampo|chapéu|chapeu/i.test(name)) return 'topo'
  return null
}

/**
 * Atribui a fita de borda às peças visíveis (que possuem banda).
 * Usa a fita por peça configurada (fitas.*) quando existir; senão fitaBorda.
 * Peças internas (caixas de gaveta) permanecem sem fita de custo.
 */
export function applyEdgeBanding(
  pieces: Piece[],
  config: ModuloConfig,
): Piece[] {
  const fitas = config.fitas ?? {}
  return pieces.map((p) => {
    const banded = p.edgeBanding.top || p.edgeBanding.bottom || p.edgeBanding.left || p.edgeBanding.right
    if (!banded || p.edgeBandId) return p
    const role = pieceRole(p.name)
    let override: string | undefined
    if (role === 'porta' && fitas.porta) override = fitas.porta
    else if (role === 'prateleira' && fitas.prateleira) override = fitas.prateleira
    else if (role === 'montante' && fitas.montante) override = fitas.montante
    else if (role === 'fundo' && fitas.fundo) override = fitas.fundo
    else if (role === 'topo' && fitas.topo) override = fitas.topo
    return { ...p, edgeBandId: override ?? config.fitaBorda }
  })
}
