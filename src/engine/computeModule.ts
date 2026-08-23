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
import { computePia } from './modules/pia'
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
  } else if (cfg.moduloTipo === 'pia') {
    const r = computePia(cfg, rules)
    pieces = r.pieces
  } else if (TIPOS_CAIXARIA.includes(cfg.moduloTipo)) {
    const r = computeArmario(cfg, rules)
    pieces = r.pieces
    hinges = r.hinges
    pistons = r.pistons
    extraWarnings = r.warnings
  }

  const piecesWithBand = applyEdgeBanding(pieces, cfg)
  const piecesOverridden = applyPecaOverrides(piecesWithBand, cfg)

  // Problema 2: aplicar sentido de veio global se configurado
  // Respeita as regras de fundo/tampo (horizontal) — sobrescreve apenas pecas estruturais
  const piecesWithGrain = config.veioGlobal
    ? piecesOverridden.map((p) => {
        // Fundos, tampos e gavetas mantêm seu veio calculado pelo motor
        const isAutoGrain = /fundo|tampo|chapéu|chapeu|Caixa Gav|Fundo Gav/i.test(p.name)
        return isAutoGrain ? p : { ...p, grainDirection: config.veioGlobal! }
      })
    : piecesOverridden

  const piecesFinal = tagPuxadorFrentes(piecesWithGrain, config.puxador)
  const warnings = [...extraWarnings, ...validate(piecesFinal, rules)]

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
    pieces: piecesFinal,
    hinges,
    pistons,
    warnings,
    dimensions: { width: config.largura, height: config.altura, depth: config.profundidade },
  }
}

/**
 * Aplica as customizações por peça (pecasCustomizadas) sobre a lista calculada:
 * material, espessura (eixo mais fino, com ancoragem pela face estrutural),
 * recuo do fundo e fitas de borda. Função pura.
 */
export function applyPecaOverrides(pieces: Piece[], config: ModuloConfig): Piece[] {
  const custom = config.pecasCustomizadas
  if (!custom) return pieces
  return pieces.map((p) => {
    const ov = custom[p.name]
    if (!ov) return p
    let np: Piece = { ...p }

    if (ov.material && ov.material !== p.materialId) np.materialId = ov.material

    if (ov.espessura && ov.espessura > 0) {
      const esp = Math.min(60, Math.max(6, ov.espessura))
      const axes: Array<['w' | 'h' | 'd', number]> = [
        ['w', p.w],
        ['h', p.h],
        ['d', p.d],
      ]
      axes.sort((a, b) => a[1] - b[1])
      const [axis] = axes[0]
      const old = axis === 'w' ? p.w : axis === 'h' ? p.h : p.d
      if (esp !== old) {
        // Ancoragem: peças à direita/topo/frente crescem "para dentro" mantendo a face visível
        const anchorMax =
          axis === 'w'
            ? /direita/i.test(p.name)
            : axis === 'h'
              ? /tampo|chapéu|chapeu|topo/i.test(p.name)
              : /porta|frente/i.test(p.name)
        np = { ...np, [axis]: esp } as Piece
        if (anchorMax) {
          const pos = { ...p.position }
          if (axis === 'w') pos.x += old - esp
          else if (axis === 'h') pos.y += old - esp
          else pos.z += old - esp
          np.position = pos
        }
      }
    }

    if (ov.recuo !== undefined && /^Fundo\b/i.test(p.name)) {
      np.position = { ...np.position, z: Math.min(Math.max(0, ov.recuo), config.profundidade / 2) }
    }

    if (ov.fitas) {
      np.edgeBanding = {
        top: ov.fitas.top ?? p.edgeBanding.top,
        bottom: ov.fitas.bottom ?? p.edgeBanding.bottom,
        left: ov.fitas.left ?? p.edgeBanding.left,
        right: ov.fitas.right ?? p.edgeBanding.right,
      }
    }

    return np
  })
}

/** Propaga o puxador da config para as peças de frente (portas + frentes de gaveta). */
export function tagPuxadorFrentes(
  pieces: Piece[],
  puxador?: { tipo: import('./types').PuxadorTipo; cor: import('./types').PuxadorCor },
): Piece[] {
  if (!puxador || puxador.tipo === 'tip_on') return pieces
  return pieces.map((p) =>
    /^(Porta |Frente )/i.test(p.name) ? { ...p, puxador: { tipo: puxador.tipo, cor: puxador.cor } } : p,
  )
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
