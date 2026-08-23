// Furação CNC — extrai lista de furos a partir do ModuleResult
// Pure engine, sem dependência de 3D. Não mexe no corte-sobmedida.
// Cada furo tem coordenada local da peça (mm) + diâmetro/profundidade.

import type { ModuleResult } from './types'

export interface DrillingHole {
  pieceName: string // nome da peça (ex: "Porta 1", "Lateral Esquerda")
  moduloNome: string // nome do módulo para agrupar
  type: 'hinge_cup' | 'hinge_plate' | 'shelf_pin'
  xMm: number // distância da borda esquerda da peça (mm)
  yMm: number // distância da borda inferior da peça (mm)
  diameterMm: number
  depthMm: number
  // referência global para debug (posição no módulo)
  globalX?: number
  globalY?: number
}

/**
 * Gera furos de dobradiça para as portas do módulo.
 * - Copa: 35mm diâmetro, centro a 21.5mm da borda lateral da porta (padrão 4.1)
 * - Profundidade típica 13mm (não atravessa 18mm)
 * - X depende do lado da dobradiça (esquerda/direita)
 */
export function computeDrilling(
  result: ModuleResult,
  moduloNome: string,
): DrillingHole[] {
  const holes: DrillingHole[] = []

  for (const h of result.hinges) {
    const idx = h.doorId.replace('porta_', '')
    const door = result.pieces.find(
      (pc) => pc.name === `Porta ${idx}` || pc.name.startsWith(`Porta ${idx} `),
    )
    if (!door) continue

    const isRightHinge =
      /direita/i.test(door.name) || /R\d/i.test(door.name.replace('Porta ', ''))

    // Centro da copa a 21.5mm da borda (regra dobradica.copoDistanciaBorda)
    const cupDist = 21.5
    const cupDiameter = 35
    const cupDepth = 13

    const xMm = isRightHinge ? door.w - cupDist : cupDist
    // yMm medido do topo da porta no motor -> converter para y da base da peça
    const yMm = door.h - h.yMm

    holes.push({
      pieceName: door.name,
      moduloNome,
      type: 'hinge_cup',
      xMm: Math.round(xMm * 10) / 10,
      yMm: Math.round(yMm * 10) / 10,
      diameterMm: cupDiameter,
      depthMm: cupDepth,
      globalX: door.position.x + xMm,
      globalY: door.position.y + yMm,
    })

    // Furo da base da dobradiça na lateral (placa) — 2 furos 4x20mm
    // Lateral correspondente: esquerda para dobradiça esquerda, direita para direita
    const lateralName = isRightHinge ? 'Lateral Direita' : 'Lateral Esquerda'
    const lateral = result.pieces.find((p) => p.name === lateralName)
    if (lateral) {
      // Posição Y na lateral = mesma altura da dobradiça no módulo
      // door.position.y é Y da porta na base do módulo; lateral vai de 0 até altura
      const hingeAbsY = door.position.y + door.h - h.yMm
      // Coordenada local na lateral: subtrai posição da lateral
      const localY = hingeAbsY - lateral.position.y
      // Placa a ~37mm da frente da lateral (padrão calço)
      const plateX = lateral.w - 37
      holes.push({
        pieceName: lateral.name,
        moduloNome,
        type: 'hinge_plate',
        xMm: Math.round(plateX * 10) / 10,
        yMm: Math.round(localY * 10) / 10,
        diameterMm: 4,
        depthMm: 13,
        globalX: lateral.position.x + plateX,
        globalY: hingeAbsY,
      })
    }
  }

  return holes
}

/** Coleta furos de todos os módulos do projeto */
export function collectDrilling(
  project: import('./environment').EnvironmentProject,
  rules: import('./rules').EngineRules,
  precomputed?: Array<{ module: import('./environment').ModuleInstance; result: ModuleResult }>,
): DrillingHole[] {
  if (precomputed) {
    const all: DrillingHole[] = []
    for (const pm of precomputed) {
      const holes = computeDrilling(pm.result, pm.module.nome || pm.module.config.moduloTipo)
      all.push(...holes)
    }
    return all
  }
  // fallback lazy import to avoid circular
  const { layoutEnvironment } = require('./environment') as typeof import('./environment')
  const { placed } = layoutEnvironment(project, rules)
  const all: DrillingHole[] = []
  for (const pm of placed) {
    const holes = computeDrilling(pm.result, pm.module.nome || pm.module.config.moduloTipo)
    all.push(...holes)
  }
  return all
}

export function drillingToCSV(holes: DrillingHole[]): string {
  const header = 'Módulo,Peça,Tipo,X (mm),Y (mm),Diâmetro (mm),Profundidade (mm)'
  const rows = holes.map((h) =>
    [
      `"${h.moduloNome}"`,
      `"${h.pieceName}"`,
      h.type,
      h.xMm,
      h.yMm,
      h.diameterMm,
      h.depthMm,
    ].join(','),
  )
  return [header, ...rows].join('\n')
}
