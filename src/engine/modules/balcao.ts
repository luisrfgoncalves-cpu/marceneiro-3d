// Módulo Balcão (Seções 5.4, 5.8, 6.1).
// Regras: base entre laterais; laterais da base ao tampo; tampo por cima com
// pingadeira; rodapé na base; portas e/ou gavetas na frente; sistema de fundo.

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import { computeFundo } from '../rules/fundo'
import { computeTampo } from '../rules/tampos'
import { computeTaponamento } from '../rules/taponamento'
import { computeGavetaCaixa } from '../rules/gaveta'
import { computePistons, layoutDoors, layoutFrentesHorizontais, layoutVasculantes } from '../rules/portas'
import { computeHingeOffsets, resolveHingeConflicts } from '../rules/dobradicas'
import type { Hinge, ModuloConfig, Piece, Piston } from '../types'

export function computeBalcao(config: ModuloConfig, rules: EngineRules) {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const tampoEsp = config.tampo.espessura
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
        h: config.rodape.altura,
        d: Math.max(P - rodRecuo, rules.rodapeEspessuraPadrao),
        position: { x: 0, y: 0, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, left: true, right: true },
      }),
    )
    baseY = config.rodape.altura
  }

  // Base (entre laterais) — fórmula Seção 9: largura − 2×lateral
  pieces.push(
    box({
      name: 'Base',
      w: L - 2 * ec,
      h: ec,
      d: P,
      position: { x: ec, y: baseY, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { top: true, left: true, right: true, bottom: true },
    }),
  )

  // Laterais — fórmula Seção 9: altura total − base − tampo
  const lateralH = A - baseY - ec - tampoEsp
  const lateralY = baseY + ec
  for (const side of ['L', 'R'] as const) {
    pieces.push(
      box({
        name: side === 'L' ? 'Lateral esquerda' : 'Lateral direita',
        w: ec,
        h: lateralH,
        d: P,
        position: { x: side === 'L' ? 0 : L - ec, y: lateralY, z: 0 },
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
      espessura: tampoEsp,
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
    w: L - 2 * ec,
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
  if (config.montantes.ativo) {
    const dePe = !config.montantes.deitado
    const montH = dePe
      ? rules.montanteMostraDePe + rules.portaRemonteMontanteDePe
      : Math.max(config.montantes.largura, rules.rodapeEspessuraPadrao)
    const montY = interior.y + interior.h - montH
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
    const gavetaZoneH = Math.min(n * frenteH + (n - 1) * minGap, interior.h)
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
          w: f.w,
          h: f.h,
          d: frenteEsp,
          position: { x: f.x, y: f.y, z: P - frenteEsp },
          materialId: config.materialExterno,
          edgeBanding: { top: true, bottom: true, left: true, right: true },
        }),
      )
      // caixa da gaveta atrás da frente
      const gavetaAltura = rules.gavetaAlturaPadrao
      const gavetaY = f.y + (f.h - gavetaAltura)
      pieces.push(
        ...computeGavetaCaixa(
          {
            x: interior.x,
            y: Math.max(gavetaY, interior.y),
            z: 0,
            largura: interior.w,
            profundidade: P - rules.gavetaRecuoTrilho,
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
      h: gavetaZone.y - interior.y,
    }
  }

  // Portas (Seção 5.8) — basculante usa pistões, demais usam dobradiças
  const portas = config.portas
  const isBasculante = portas.tipo === 'basculante'
  const doors = isBasculante
    ? layoutVasculantes(doorArea, portas.quantidade, rules)
    : layoutDoors(doorArea, portas.quantidade, portas.tipo, rules)
  const portaEsp = portas.espessura
  for (const d of doors) {
    pieces.push(
      box({
        name: `Porta ${d.index + 1}`,
        w: d.w,
        h: d.h,
        d: portaEsp,
        position: { x: d.x, y: d.y, z: d.z - portaEsp },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
    if (isBasculante) {
      if (portas.pistao) pistons.push(...computePistons([d]))
    } else {
      const computed = computeHingeOffsets(
        { doorId: `porta_${d.index + 1}`, doorHeightMm: d.h, doorTopY: d.y, count: portas.dobradicasPorPorta },
        rules,
      )
      const resolved = resolveHingeConflicts(computed, d.y, [], rules)
      hinges.push(...resolved.hinges)
    }
  }

  return { pieces, hinges, pistons }
}
