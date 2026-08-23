// Exportação DXF R12 ASCII (CNC/sectionadoras) — escritor mínimo próprio,
// sem dependências externas. Uma camada (layer) por peça, retângulo da vista
// frontal (mm). Compatível com importadores de corte e nesting.

import type { ModuleResult } from '../engine/types'
import type { PlacedModule } from '../engine/environment'
import { layoutEnvironment, type EnvironmentProject } from '../engine/environment'

export interface DxfRect {
  name: string
  x: number
  y: number
  w: number
  h: number
}

const num = (v: number): string => {
  const r = Math.round(v * 1000) / 1000
  return Number.isFinite(r) ? String(r) : '0'
}

/** Sanitiza nome de peça para layer DXF (ASCII, sem espaços, único). */
export function sanitizeLayer(name: string, used: Set<string>): string {
  let base =
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'PEC'
  base = base.slice(0, 60)
  let candidate = base
  let i = 2
  while (used.has(candidate.toUpperCase())) {
    candidate = `${base}_${i}`
    i += 1
  }
  used.add(candidate.toUpperCase())
  return candidate
}

/**
 * Monta um DXF R12 com um retângulo por peça (cada uma em sua layer) +
 * TEXT com a cota LxH no canto do retângulo.
 */
export function buildDxf(rects: DxfRect[]): string {
  const out: string[] = []
  const p = (code: number | string, value: string | number) => out.push(String(code), String(value))

  const usedLayers = new Set<string>()
  const layers = rects.map((r) => sanitizeLayer(r.name, usedLayers))

  p(0, 'SECTION')
  p(2, 'HEADER')
  p(9, '$ACADVER')
  p(1, 'AC1009')
  p(9, '$INSUNITS')
  p(70, 4)
  p(0, 'ENDSEC')

  p(0, 'SECTION')
  p(2, 'TABLES')
  p(0, 'TABLE')
  p(2, 'LAYER')
  p(70, layers.length)
  for (const layer of layers) {
    p(0, 'LAYER')
    p(2, layer)
    p(70, 0)
    p(62, 7)
    p(6, 'CONTINUOUS')
  }
  p(0, 'ENDTAB')
  p(0, 'ENDSEC')

  p(0, 'SECTION')
  p(2, 'ENTITIES')

  rects.forEach((r, idx) => {
    const layer = layers[idx]
    const pts: Array<[number, number]> = [
      [r.x, r.y],
      [r.x + r.w, r.y],
      [r.x + r.w, r.y + r.h],
      [r.x, r.y + r.h],
    ]
    for (let i = 0; i < 4; i++) {
      const [x1, y1] = pts[i]
      const [x2, y2] = pts[(i + 1) % 4]
      p(0, 'LINE')
      p(8, layer)
      p(10, num(x1))
      p(20, num(y1))
      p(30, 0)
      p(11, num(x2))
      p(21, num(y2))
      p(31, 0)
    }
    p(0, 'TEXT')
    p(8, layer)
    p(10, num(r.x + 5))
    p(20, num(r.y + 5))
    p(30, 0)
    p(40, Math.min(Math.max(r.h / 6, 8), 40))
    p(1, `${Math.round(r.w)}x${Math.round(r.h)}`)
  })

  p(0, 'ENDSEC')
  p(0, 'EOF')
  return out.join('\r\n') + '\r\n'
}

/** Retângulos da vista frontal de um módulo (origem no canto inferior esquerdo). */
export function moduleDxfRects(result: ModuleResult): DxfRect[] {
  return result.pieces.map((pc) => ({
    name: pc.name,
    x: pc.position.x,
    y: pc.position.y,
    w: pc.w,
    h: pc.h,
  }))
}

/** DXF do projeto completo — módulos já transladados pela ordem do ambiente. */
export function projectDxf(project: EnvironmentProject, rules: Parameters<typeof layoutEnvironment>[1]): string {
  const { placed } = layoutEnvironment({ modulos: project.modulos }, rules)
  const rects: DxfRect[] = []
  placed.forEach((pm: PlacedModule, mi) => {
    const posZ = Number.isFinite(pm.module.posZ) ? (pm.module.posZ as number) : 0
    for (const pc of pm.result.pieces) {
      rects.push({
        name: `${mi + 1}-${pm.module.nome || pm.module.config.moduloTipo}-${pc.name}`,
        x: pc.position.x + pm.offsetX,
        y: pc.position.y,
        w: pc.w,
        h: pc.h,
      })
    }
    void posZ
  })
  return buildDxf(rects)
}

export function downloadDxf(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/dxf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.dxf') ? filename : `${filename}.dxf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
