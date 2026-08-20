// Módulo Balcão (Seções 5.4, 5.8, 6.1).
// Regras: base entre laterais; laterais da base ao tampo; tampo com pingadeira;
// rodapé na base; portas e/ou gavetas na frente; sistema de fundo.

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import { computeFundo } from '../rules/fundo'
import { computeTampo } from '../rules/tampos'
import { computeTaponamento } from '../rules/taponamento'
import { computeGavetaCaixa } from '../rules/gaveta'
import { computePistons, layoutDoors, layoutFrentesHorizontais, layoutVasculantes } from '../rules/portas'
import { computeHingeOffsets, resolveHingeConflicts } from '../rules/dobradicas'
import type { Hinge, ModuloConfig, Piece, Piston } from '../types'

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function computeBalcao(config: ModuloConfig, rules: EngineRules) {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const tampoEsp = clamp(config.tampo.espessura, 15, 360) // Garantir espessura mínima
  const pieces: Piece[] = []
  const hinges: Hinge[] = []
  const pistons: Piston[] = []

  // Rodapé (Seção 4.6)
  let baseY = 0
  if (config.rodape.ativo) {
    const rodRecuo = config.rodape.recuo
    pieces.push(
      box({
        name: 'Rodapé',
        w: L,
        h: clamp(config.rodape.altura, 1, 500),
        d: Math.max(P - rodRecuo, rules.rodapeEspessuraPadrao),
        position: { x: 0, y: 0, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, left: true, right: true },
      }),
    )
    baseY = config.rodape.altura
  }

  // Base (entre laterais) — fórmula Seção 9: largura − 2×lateral
  // Garantir largura mínima
  const baseW = Math.max(1, L - 2 * ec)
  pieces.push(
    box({
      name: 'Base',
      w: baseW,
      h: ec,
      d: P,
      position: { x: clamp(ec, 1, L - 1), y: baseY, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { top: true, left: true, right: true, bottom: true },
    }),
  )

  // Laterais — fórmula Seção 9: altura total − base − tampo
  // Garantir altura mínima
  const lateralH = Math.max(1, A - baseY - ec - tampoEsp)
  const lateralY = baseY + ec
  for (const side of ['L', 'R'] as const) {
    pieces.push(
      box({
        name: side === 'L' ? 'Lateral esquerda' : 'Lateral direita',
        w: ec,
        h: lateralH,
        d: P,
        position: { x: clamp(side === 'L' ? 0 : L - ec, 0, L - 1), y: lateralY, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
  }

  // Tampo (Seção 5.4)
  pieces.push(
    ...computeTampo({
      moduleWidth: L,
      moduleDepth: P,
      moduleHeight: A,
      espessura: clamp(tampoEsp, 15, 360),
      pingadeiraFrente: config.tampo.pingadeiraFrente,
      pingadeiraLados: config.tampo.pingadeiraLados,
      materialId: config.materialExterno,
      material: config.tampo.material,
      cuba: config.tampo.cuba,
      cooktop: config.tampo.cooktop,
    }),
  )

  // Vão interior (da base ao tampo, entre laterais)
  const interior: Region = {
    x: ec,
    y: lateralY,
    w: clamp(L - 2 * ec, 1, L - 1),
    h: lateralH,
    z: 0,
    d: P,
  }

  // Fundo (Seção 5.1)
  pieces.push(...computeFundo(config.sistemaFundo, interior, ec, config.materialInterno, rules))

  // Taponamento (Seção 5.3)
  pieces.push(
    ...computeTaponamento(
      { lado: config.taponamento.esquerda, side: 'esquerda', moduleWidth: L, moduleDepth: P, height: lateralH, y: lateralY, materialId: config.materialExterno },
      rules,
    ),
    ...computeTaponamento(
      { lado: config.taponamento.direita, side: 'direita', moduleWidth: L, moduleDepth: P, height: lateralH, y: lateralY, materialId: config.materialExterno },
      rules,
    ),
  )

  // Montante (Seções 5.7, 5.9, 6.1) — sempre por dentro das laterais, no topo.
  // Orientação deitado/pé define como a porta cobre o montante na emenda.
  let doorArea: Region = { ...interior }
  let montH = 0
  let montY = 0
  if (config.montantes.ativo) {
    const dePe = !config.montantes.deitado
    // Garantir altura mínima de montante
    const montanteAlturaMin = Math.max(1, rules.montanteMostraDePe + rules.portaRemonteMontanteDePe)
    montH = dePe
      ? Math.max(montanteAlturaMin, rules.montanteMostraDePe + rules.portaRemonteMontanteDePe)
      : Math.max(clamp(config.montantes.largura, 1, L - 1), rules.rodapeEspessuraPadrao)
    montY = interior.y + interior.h - montH
    pieces.push(
      box({
        name: 'Montante',
        w: interior.w,
        h: montH,
        d: P,
        position: { x: interior.x, y: montY, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, left: true, right: true },
      }),
    )
    // De pé: porta/frente remonta sobre o montante deixando 3cm à mostra (5.9).
    // +gapTampo compensa a subtração de layoutDoors → 30mm de montante visível.
    if (dePe) doorArea = { ...interior, h: interior.h - rules.montanteMostraDePe + rules.portaGapTampo }
  }

  // Gavetas (faixa superior)
  if (config.gavetas.quantidade > 0) {
    const n = config.gavetas.quantidade
    const frenteH = rules.gavetaFrenteAltura
    const minGap = rules.vaoHorizontal
    const gavetaZoneH = Math.min(n * frenteH + (n - 1) * minGap, clamp(interior.h, 1, interior.h))
    const zoneTop = interior.y + interior.h
    const gavetaZone: Region = {
      ...interior,
      y: zoneTop - gavetaZoneH,
      h: gavetaZoneH,
    }
    const frentes = layoutFrentesHorizontais(gavetaZone, n, frenteH, rules)
    const frenteEsp = rules.gavetaFrenteEspessura
    for (const f of frentes) {
      pieces.push(
        box({
          name: `Frente gaveta ${f.index + 1}`,
          w: Math.max(1, f.w),
          h: Math.max(1, f.h),
          d: Math.max(1, frenteEsp),
          position: { x: clamp(f.x, 0, L - 1), y: clamp(f.y, interior.y, interior.y + interior.h), z: Math.max(0, P - frenteEsp) },
          materialId: config.materialExterno,
          edgeBanding: { top: true, bottom: true, left: true, right: true },
        }),
      )
      // caixa da gaveta atrás da frente
      const gavetaAltura = rules.gavetaAlturaPadrao
      const minGavetaY = config.montantes.ativo ? montY : interior.y
      const gavetaY = Math.max(f.y + (f.h - gavetaAltura), minGavetaY)
      pieces.push(
        ...computeGavetaCaixa(
          {
            x: interior.x,
            y: gavetaY,
            z: 0,
            largura: interior.w,
            profundidade: Math.max(1, P - rules.gavetaRecuoTrilho),
            altura: gavetaAltura,
            sistema: config.gavetas.sistema,
            espessura: config.gavetas.espessura,
          },
          config.materialInterno,
          rules,
        ),
      )
    }
    // portas ocupam a faixa abaixo das gavetas
    doorArea = {
      ...interior,
      h: Math.max(1, gavetaZone.y - interior.y),
    }
  }

  // Portas (Seção 5.8) — basculante usa pistões, demais usam dobradiças
  const portas = config.portas
  const isBasculante = portas.tipo === 'basculante'
  const doors = isBasculante
    ? layoutVasculantes(doorArea, portas.quantidade, rules)
    : layoutDoors(doorArea, portas.quantidade, portas.tipo, rules)
  const portaEsp = Math.max(1, portas.espessura)
  for (const d of doors) {
    // Garantir dimensões mínimas da porta
    const doorW = Math.max(1, d.w)
    const doorH = Math.max(1, d.h)
    pieces.push(
      box({
        name: `Porta ${d.index + 1}`,
        w: doorW,
        h: doorH,
        d: portaEsp,
        position: { x: clamp(d.x, 0, L - 1), y: clamp(d.y, 0, L - 1), z: Math.max(0, d.z - portaEsp) },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
    if (isBasculante) {
      if (portas.pistao) pistons.push(...computePistons([d]))
    } else {
      const computed = computeHingeOffsets(
        { doorId: `porta_${d.index + 1}`, doorHeightMm: doorH, doorTopY: d.y, count: portas.dobradicasPorPorta },
        rules,
      )
      const resolved = resolveHingeConflicts(computed, d.y, [], rules)
      hinges.push(...resolved.hinges)
    }
  }

  return { pieces, hinges, pistons }
}