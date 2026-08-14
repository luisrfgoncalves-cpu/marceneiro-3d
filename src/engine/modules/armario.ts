// Caixaria "base e chapéu passam" (Seção 6.1) — usada por armário, aéreo,
// torre e guarda-roupa. Diferente do balcão: NÃO há tampo em balanço; base e
// chapéu atravessam a largura total (peça mestra) e as laterais ficam entre eles.

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import { computeFundo } from '../rules/fundo'
import { computeTaponamento } from '../rules/taponamento'
import { computePistons, layoutDoors, layoutVasculantes } from '../rules/portas'
import { computeHingeOffsets, resolveHingeConflicts, type ConflictZone } from '../rules/dobradicas'
import type { Hinge, ModuloConfig, Piece, Piston, Warning } from '../types'

export function computeArmario(config: ModuloConfig, rules: EngineRules) {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const pieces: Piece[] = []
  const hinges: Hinge[] = []
  const pistons: Piston[] = []
  const warnings: Warning[] = []

  // Aéreo (Seção 11.2) é suspenso — nunca tem rodapé
  const temRodape = config.moduloTipo !== 'aereo' && config.rodape.ativo
  let baseY = 0
  if (temRodape) {
    pieces.push(
      box({
        name: 'Rodapé',
        w: L,
        h: config.rodape.altura,
        d: Math.max(P - config.rodape.recuo, rules.rodapeEspessuraPadrao),
        position: { x: 0, y: 0, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, left: true, right: true },
      }),
    )
    baseY = config.rodape.altura
  }

  // Base "passa" — largura total (peça mestra, Seção 6.1)
  pieces.push(
    box({
      name: 'Base',
      w: L,
      h: ec,
      d: P,
      position: { x: 0, y: baseY, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { top: true, left: true, right: true, bottom: true },
    }),
  )

  // Chapéu "passa" — largura total
  pieces.push(
    box({
      name: 'Chapéu',
      w: L,
      h: ec,
      d: P,
      position: { x: 0, y: A - ec, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { bottom: true, left: true, right: true, top: true },
    }),
  )

  // Laterais entre base e chapéu
  const lateralH = A - baseY - 2 * ec
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

  // Montante (Seções 5.7, 5.9, 6.1) — por dentro das laterais, no topo do vão.
  // Deitado/pé define como a porta cobre o montante na emenda entre módulos.
  let doorArea: Region = { ...interior }
  if (config.montantes.ativo) {
    const dePe = !config.montantes.deitado
    const montH = dePe
      ? rules.montanteMostraDePe + rules.portaRemonteMontanteDePe
      : Math.max(config.montantes.largura, rules.rodapeEspessuraPadrao)
    pieces.push(
      box({
        name: 'Montante',
        w: interior.w,
        h: montH,
        d: P,
        position: { x: interior.x, y: interior.y + interior.h - montH, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, left: true, right: true },
      }),
    )
    if (dePe) doorArea = { ...interior, h: interior.h - rules.montanteMostraDePe + rules.portaGapTampo }
  }

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

  // Prateleiras (Seção 5.6) — divisão em vãos iguais
  const shelfZones: ConflictZone[] = []
  const n = Math.min(config.prateleiras.quantidade, 8)
  if (n > 0) {
    const esp = config.prateleiras.espessura
    const folga = rules.prateleiraFolga
    const w = interior.w - 2 * folga
    for (let i = 1; i <= n; i += 1) {
      const y = interior.y + (interior.h * i) / (n + 1)
      pieces.push(
        box({
          name: `Prateleira ${i}`,
          w,
          h: esp,
          d: interior.d,
          position: { x: interior.x + folga, y: y - esp, z: interior.z },
          materialId: config.materialInterno,
          edgeBanding: { left: true, right: true },
        }),
      )
      shelfZones.push({ top: y, bottom: y - esp })
    }
  }

  // Portas na frente do vão
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
      const resolved = resolveHingeConflicts(computed, d.y, shelfZones, rules)
      hinges.push(...resolved.hinges)
      if (resolved.relocations > 0) {
        warnings.push({
          type: 'dobradica_conflito',
          pieceName: `Porta ${d.index + 1}`,
          message: `${resolved.relocations} dobradiça(s) realocada(s) por conflito com prateleira.`,
        })
      }
    }
  }

  return { pieces, hinges, pistons, warnings }
}