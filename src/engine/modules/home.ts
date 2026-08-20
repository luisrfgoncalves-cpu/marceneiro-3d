// Módulo Home / Rack (Seção 6.4).
// Categoria de configuração livre: suporta portas embutidas ou sobrepostas,
// fundo opcional e vãos abertos.

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import { computeFundo } from '../rules/fundo'
import { computeTaponamento } from '../rules/taponamento'
import { computePistons, layoutDoors, layoutVasculantes } from '../rules/portas'
import { computeHingeOffsets, resolveHingeConflicts, type ConflictZone } from '../rules/dobradicas'
import type { Hinge, ModuloConfig, Piece, Piston, Warning } from '../types'

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function computeHome(config: ModuloConfig, rules: EngineRules) {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const pieces: Piece[] = []
  const hinges: Hinge[] = []
  const pistons: Piston[] = []
  const warnings: Warning[] = []

  // Rodapé opcional
  let baseY = 0
  if (config.rodape.ativo) {
    pieces.push(
      box({
        name: 'Rodapé',
        w: clamp(L, 1, 500),
        h: clamp(config.rodape.altura, 1, 500),
        d: Math.max(clamp(P - config.rodape.recuo, 1, 500), rules.rodapeEspessuraPadrao),
        position: { x: 0, y: 0, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, left: true, right: true },
      }),
    )
    baseY = config.rodape.altura
  }

  // Base e chapéu "passam" (como no armário convencional)
  const baseH = Math.max(1, ec)
  pieces.push(
    box({
      name: 'Base',
      w: clamp(L, 1, 500),
      h: baseH,
      d: clamp(P, 1, 500),
      position: { x: 0, y: baseY, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { top: true, left: true, right: true, bottom: true },
    }),
    box({
      name: 'Chapéu',
      w: clamp(L, 1, 500),
      h: baseH,
      d: clamp(P, 1, 500),
      position: { x: 0, y: A - baseH, z: 0 },
      materialId: config.materialExterno,
      edgeBanding: { bottom: true, left: true, right: true, top: true },
    }),
  )

  // Laterais entre base e chapéu
  const lateralH = Math.max(1, A - baseY - 2 * ec)
  const lateralY = baseY + ec
  for (const side of ['L', 'R'] as const) {
    pieces.push(
      box({
        name: side === 'L' ? 'Lateral esquerda' : 'Lateral direita',
        w: clamp(ec, 1, L - 1),
        h: lateralH,
        d: clamp(P, 1, 500),
        position: { x: clamp(side === 'L' ? 0 : L - ec, 0, L - 1), y: lateralY, z: 0 },
        materialId: config.materialExterno,
        edgeBanding: { top: true, bottom: true, left: true, right: true },
      }),
    )
  }

  const interior: Region = {
    x: clamp(ec, 1, L - 1),
    y: lateralY,
    w: clamp(L - 2 * ec, 1, L - 1),
    h: lateralH,
    z: 0,
    d: clamp(P, 1, 500),
  }

  // Fundo opcional
  pieces.push(...computeFundo(config.sistemaFundo, interior, ec, config.materialInterno, rules))

  // Taponamento opcional
  pieces.push(
    ...computeTaponamento(
      { lado: config.taponamento.esquerda, side: 'esquerda', moduleWidth: clamp(L, 1, 500), moduleDepth: clamp(P, 1, 500), height: lateralH, y: lateralY, materialId: config.materialExterno },
      rules,
    ),
    ...computeTaponamento(
      { lado: config.taponamento.direita, side: 'direita', moduleWidth: clamp(L, 1, 500), moduleDepth: clamp(P, 1, 500), height: lateralH, y: lateralY, materialId: config.materialExterno },
      rules,
    ),
  )

  // Prateleiras internas
  const shelfZones: ConflictZone[] = []
  const n = Math.min(config.prateleiras.quantidade, 8)
  if (n > 0) {
    const esp = clamp(config.prateleiras.espessura, 1, 100)
    const folga = rules.prateleiraFolga
    const w = clamp(L - 2 * folga, 1, L - 1)
    for (let i = 1; i <= n; i += 1) {
      const y = interior.y + (interior.h * i) / (n + 1)
      pieces.push(
        box({
          name: `Prateleira ${i}`,
          w: w,
          h: esp,
          d: clamp(interior.d, 1, 500),
          position: { x: clamp(interior.x + folga, 1, L - 2), y: clamp(y - esp, interior.y, interior.y + interior.h), z: interior.z },
          materialId: config.materialInterno,
          edgeBanding: { left: true, right: true },
        }),
      )
      shelfZones.push({ top: y, bottom: y - esp })
    }
  }

  // Portas
  const portas = config.portas
  const isBasculante = portas.tipo === 'basculante'
  const doors = isBasculante
    ? layoutVasculantes(interior, portas.quantidade, rules)
    : layoutDoors(interior, portas.quantidade, portas.tipo, rules)
  const portaEsp = clamp(portas.espessura, 1, 200)

  for (const d of doors) {
    const doorW = Math.max(1, d.w)
    const doorH = Math.max(1, d.h)

    // Check if door is embutida (recessed into the frame)
    const isEmbutida = (portas as any).embutida ?? false

    let zPos = Math.max(0, d.z - portaEsp)
    let finalW = doorW
    let finalH = doorH
    let finalX = Math.max(1, d.x)
    let finalY = Math.max(1, d.y)

    if (isEmbutida) {
      zPos = Math.max(0, d.z - portaEsp - ec) // recess more for the frame
      finalW = Math.max(1, d.w - 2 * rules.portaGapLateral)
      finalH = Math.max(1, d.h - 2 * rules.portaGapLateral)
      finalX = Math.max(1, d.x + rules.portaGapLateral)
      finalY = Math.max(1, d.y + rules.portaGapLateral)
    }

    pieces.push(
      box({
        name: `Porta ${d.index + 1}${isEmbutida ? ' (embutida)' : ''}`,
        w: finalW,
        h: finalH,
        d: portaEsp,
        position: { x: finalX, y: finalY, z: zPos },
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