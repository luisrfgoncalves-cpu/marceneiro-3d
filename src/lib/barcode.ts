// Geração de etiquetas com código de barras (JsBarcode)
// Uso: gera SVG/PNG para etiquetar chapas e ferragens no estoque.

import JsBarcode from 'jsbarcode'

export interface BarcodeOptions {
  value: string
  displayValue?: string
  format?: string  // 'CODE128' | 'EAN13' | 'QR' etc.
  width?: number
  height?: number
}

/** Gera um SVG do código de barras como string */
export function generateBarcodeSVG(opts: BarcodeOptions): string {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  JsBarcode(svg, opts.value, {
    format: opts.format ?? 'CODE128',
    displayValue: opts.displayValue !== undefined ? true : true,
    text: opts.displayValue ?? opts.value,
    fontSize: 12,
    width: opts.width ?? 2,
    height: opts.height ?? 60,
    margin: 8,
    background: '#ffffff',
    lineColor: '#1e293b',
  })
  return svg.outerHTML
}

/** Baixa uma etiqueta PNG do código de barras */
export function downloadBarcode(value: string, label: string): void {
  const canvas = document.createElement('canvas')
  JsBarcode(canvas, value, {
    format: 'CODE128',
    displayValue: true,
    text: label,
    fontSize: 14,
    width: 2.5,
    height: 80,
    margin: 12,
    background: '#ffffff',
    lineColor: '#1e293b',
  })
  const url = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = url
  link.download = `etiqueta_${value.replace(/\s+/g, '_')}.png`
  link.click()
}
