// Módulo Home / Rack (Seção 6.4).
// Categoria de configuração livre: suporta portas embutidas ou sobrepostas,
// fundo opcional e vãos abertos.

import type { EngineRules } from '../rules'
import { box, type Region } from '../geometry'
import { computeFundo } from '../rules/fundo'
import { computeTaponamento } from '../rules/taponamento'
import { computePistons, layoutDoors, layoutVasculantes } from '../rules/portas'
import { computeHingeOffsets, resolveHingeConflicts } from '../rules/dobradicas'
import type { Hinge, ModuloConfig, Piece, Piston } from '../types'

export function computeHome(config: ModuloConfig, rules: EngineRules) {
  const L = config.largura
  const A = config.altura
  const P = config.profundidade
  const ec = config.espessuraCaixa
  const pieces: Piece[] = []
  const hinges: Hinge[] = []
  const pistons: Piston[] = []

  // Rodapé opcional (assim como balcão)
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

  // Base e chapéu "passam" (como no armário convencional)
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

  // Fundo opcional (Seção 6.4: 6mm, espessura maior, ou sem fundo)
  pieces.push(...computeFundo(config.sistemaFundo, interior, ec, config.materialInterno, rules))

  // Taponamento opcional
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

  // Prateleiras internas (Seção 5.6)
  const shelfZones: Array<{ top: number; bottom: number }> = []
  const nPrateleiras = Math.min(config.prateleiras.quantidade, 8)
  if (nPrateleiras > 0) {
    const esp = config.prateleiras.espessura
    const folga = rules.prateleiraFolga
    const w = interior.w - 2 * folga
    for (let i = 1; i <= nPrateleiras; i += 1) {
      const y = interior.y + (interior.h * i) / (nPrateleiras + 1)
      pieces.push(
        box({
          name: `Prateleira ${i}`,
          w,
          h: esp,
          d: interior.d - ec, // um recuo leve para cabos/nichos
          position: { x: interior.x + folga, y: y - esp, z: interior.z },
          materialId: config.materialInterno,
          edgeBanding: { left: true, right: true },
        }),
      )
      shelfZones.push({ top: y, bottom: y - esp })
    }
  }

  // Portas (Seção 6.4: sobreposta ou embutida)
  const portas = config.portas
  if (portas.quantidade > 0) {
    const isBasculante = portas.tipo === 'basculante'
    const doors = isBasculante
      ? layoutVasculantes(interior, portas.quantidade, rules)
      : layoutDoors(interior, portas.quantidade, portas.tipo, rules)
    const portaEsp = portas.espessura

    // Verifica se a porta é embutida. Se sim, ela recua para dentro da lateral (z recua pelo valor da espessura da porta).
    // Opcionalmente, pode ser configurado em config.portas.embutida (booleano).
    // Para Home/Rack suportamos por padrão embutida se configurada.
    const isEmbutida = (portas as any).embutida ?? false

    for (const d of doors) {
      const zPos = isEmbutida
        ? d.z - portaEsp - ec // recuada para dentro do montante/lateral
        : d.z - portaEsp

      pieces.push(
        box({
          name: `Porta ${d.index + 1}${isEmbutida ? ' (embutida)' : ''}`,
          w: isEmbutida ? d.w - 2 * rules.portaGapLateral : d.w,
          h: isEmbutida ? d.h - 2 * rules.portaGapLateral : d.h,
          d: portaEsp,
          position: {
            x: isEmbutida ? d.x + rules.portaGapLateral : d.x,
            y: isEmbutida ? d.y + rules.portaGapLateral : d.y,
            z: zPos,
          },
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
      }
    }
  }

  return { pieces, hinges, pistons }
}
