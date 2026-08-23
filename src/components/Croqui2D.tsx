// Croqui 2D técnico (Fase 5) — vista frontal + planta geradas das peças do motor,
// com cotas totais, grid de 100mm e downloads SVG/PNG. Estilo croqui do MD.

import { useMemo, useRef } from 'react'
import type { ModuleResult } from '../engine/types'

const STROKE = '#334155'
const GRID = '#94a3b8'
const COTA = '#7c3aed'

function useProjection(result: ModuleResult) {
  return useMemo(() => {
    const { width, height, depth } = result.dimensions
    // Frontal (XY): desenha de trás para frente
    const frontal = [...result.pieces]
      .sort((a, b) => a.position.z - b.position.z)
      .map((p, i) => ({
        key: `${p.id}_${i}`,
        name: p.name,
        x: p.position.x,
        y: height - (p.position.y + p.h),
        w: p.w,
        h: p.h,
      }))
    // Planta (XZ): y do svg = profundidade invertida (frente embaixo)
    const planta = result.pieces.map((p) => ({
      key: `pl_${p.id}`,
      name: p.name,
      x: p.position.x,
      y: depth - (p.position.z + p.d),
      w: p.w,
      h: p.d,
    }))
    return { width, height, depth, frontal, planta }
  }, [result])
}

function DimLine({ x1, y1, x2, y2, label, vertical }: {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  vertical?: boolean
}) {
  const tick = 14
  return (
    <g stroke={COTA} strokeWidth={3} fill="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      {vertical ? (
        <>
          <line x1={x1 - tick} y1={y1} x2={x1 + tick} y2={y1} />
          <line x1={x2 - tick} y1={y2} x2={x2 + tick} y2={y2} />
        </>
      ) : (
        <>
          <line x1={x1} y1={y1 - tick} x2={x1} y2={y1 + tick} />
          <line x1={x2} y1={y2 - tick} x2={x2} y2={y2 + tick} />
        </>
      )}
      <text
        x={(x1 + x2) / 2}
        y={(y1 + y2) / 2 - (vertical ? -8 : 12)}
        fill={COTA}
        stroke="none"
        fontSize={34}
        fontWeight={700}
        fontFamily="ui-monospace, monospace"
        textAnchor="middle"
        transform={vertical ? `rotate(-90 ${(x1 + x2) / 2} ${(y1 + y2) / 2})` : undefined}
      >
        {label}
      </text>
    </g>
  )
}

function PlanView({ rects, vbW, vbH, title }: {
  rects: Array<{ key: string; name: string; x: number; y: number; w: number; h: number }>
  vbW: number
  vbH: number
  title: string
}) {
  return (
    <g>
      <text x={0} y={-16} fontSize={40} fontWeight={800} fill="#0f172a" opacity={0.85}>
        {title}
      </text>
      {/* grid 100mm */}
      {Array.from({ length: Math.floor(vbW / 100) }, (_, i) => (
        <line key={`gx${i}`} x1={(i + 1) * 100} y1={0} x2={(i + 1) * 100} y2={vbH} stroke={GRID} strokeWidth={0.6} strokeDasharray="6 10" opacity={0.35} />
      ))}
      {Array.from({ length: Math.floor(vbH / 100) }, (_, i) => (
        <line key={`gy${i}`} x1={0} y1={(i + 1) * 100} x2={vbW} y2={(i + 1) * 100} stroke={GRID} strokeWidth={0.6} strokeDasharray="6 10" opacity={0.35} />
      ))}
      {rects.map((r) => (
        <g key={r.key}>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="#64748b" fillOpacity={0.13} stroke={STROKE} strokeWidth={2.4} rx={3} />
          {r.w > 150 && r.h > 70 && (
            <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 8} fontSize={24} textAnchor="middle" fill={STROKE} fontFamily="ui-sans-serif, system-ui">
              {r.name}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

export function Croqui2D({ result }: { result: ModuleResult }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const { width, height, depth, frontal, planta } = useProjection(result)

  const pad = 90
  const gap = 120
  const totalH = height + pad * 2 + gap + depth + pad

  const downloadSvg = () => {
    if (!svgRef.current) return
    const xml = new XMLSerializer().serializeToString(svgRef.current)
    const blob = new Blob([xml], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'croqui.svg'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
  }

  const downloadPng = () => {
    if (!svgRef.current) return
    const xml = new XMLSerializer().serializeToString(svgRef.current)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = width + pad * 2
      canvas.height = totalH
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((b) => {
        if (!b) return
        const url = URL.createObjectURL(b)
        const a = document.createElement('a')
        a.href = url
        a.download = 'croqui.png'
        a.click()
        setTimeout(() => URL.revokeObjectURL(url), 1500)
      })
    }
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(xml)))}`
  }

  return (
    <div className="w-full overflow-auto custom-scrollbar bg-white rounded-xl p-3">
      <svg
        ref={svgRef}
        viewBox={`${-pad} ${-pad} ${width + pad * 2} ${totalH}`}
        width="100%"
        style={{ minWidth: 420 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <PlanView rects={frontal} vbW={width} vbH={height} title="Vista frontal" />
        <DimLine x1={0} y1={height + 46} x2={width} y2={height + 46} label={`${Math.round(width)} mm`} />

        <g transform={`translate(0 ${height + gap})`}>
          <PlanView rects={planta} vbW={width} vbH={depth} title="Planta" />
          <DimLine x1={0} y1={depth + 46} x2={width} y2={depth + 46} label={`${Math.round(width)} mm`} />
          <g transform={`translate(${-52} 0)`}>
            <DimLine x1={0} y1={0} x2={0} y2={depth} label={`${Math.round(depth)} mm`} vertical />
          </g>
        </g>

        <g transform={`translate(${-52} 0)`}>
          <DimLine x1={0} y1={0} x2={0} y2={height} label={`${Math.round(height)} mm`} vertical />
        </g>
      </svg>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button type="button" onClick={downloadSvg} className="rounded-lg border border-border-strong px-2.5 py-1.5 text-[11px] font-bold text-text-muted hover:text-text-base transition-all">
          Baixar SVG
        </button>
        <button type="button" onClick={downloadPng} className="rounded-lg border border-border-strong px-2.5 py-1.5 text-[11px] font-bold text-text-muted hover:text-text-base transition-all">
          Baixar PNG
        </button>
      </div>
    </div>
  )
}
