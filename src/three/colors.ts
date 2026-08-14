// Mapa de cores para o preview 3D. No M1 é um mapa simplificado por id de
// material; num milestone posterior virá do cadastro de materiais no banco.

export const MATERIAL_COLORS: Record<string, string> = {
  mdf_branco_tx_15mm: '#f2efe9',
  mdf_branco_tx_18mm: '#f2efe9',
  mdf_maderado_x_18mm: '#b98a5a',
  mdf_maderado_escuro_18mm: '#8a5a33',
  mdf_preto_18mm: '#2c2c30',
  mdf_cinza_18mm: '#9aa0a8',
}

export function materialColor(materialId: string): string {
  return MATERIAL_COLORS[materialId] ?? '#c9b59a'
}

export interface Swatch {
  id: string
  label: string
  color: string
}

export const COLOR_SWATCHES: Swatch[] = [
  { id: 'mdf_branco_tx_18mm', label: 'Branco TX', color: '#f2efe9' },
  { id: 'mdf_maderado_x_18mm', label: 'Maderado', color: '#b98a5a' },
  { id: 'mdf_maderado_escuro_18mm', label: 'Maderado escuro', color: '#8a5a33' },
  { id: 'mdf_cinza_18mm', label: 'Cinza', color: '#9aa0a8' },
  { id: 'mdf_preto_18mm', label: 'Preto', color: '#2c2c30' },
]

export const BRANCO_TX_ID = 'mdf_branco_tx_15mm'
