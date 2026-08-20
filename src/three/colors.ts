// Mapa de cores para o preview 3D.
// Atualizado com paleta premium de alta fidelidade:
// MDF Branco TX realista, maderados texturizados de nogueira/carvalho e cores sólidas elegantes.

export const MATERIAL_COLORS: Record<string, string> = {
  mdf_branco_tx_15mm: '#f5f0e8', // Off-white quente e fosco (Branco TX comercial)
  mdf_branco_tx_18mm: '#f5f0e8',
  mdf_maderado_x_18mm: '#d4aa7d', // Carvalho Natural / Mel (muito comum em móveis modernos)
  mdf_maderado_escuro_18mm: '#6d4c41', // Nogueira Escura elegante
  mdf_cinza_18mm: '#546e7a', // Cinza Sagrado / Grafite fosco
  mdf_preto_18mm: '#212121', // Preto Absoluto Matte
}

export function materialColor(materialId: string): string {
  return MATERIAL_COLORS[materialId] ?? '#d4aa7d'
}

export interface Swatch {
  id: string
  label: string
  color: string
}

export const COLOR_SWATCHES: Swatch[] = [
  { id: 'mdf_branco_tx_18mm', label: 'Branco TX', color: '#f5f0e8' },
  { id: 'mdf_maderado_x_18mm', label: 'Carvalho Mel', color: '#d4aa7d' },
  { id: 'mdf_maderado_escuro_18mm', label: 'Nogueira Calda', color: '#6d4c41' },
  { id: 'mdf_cinza_18mm', label: 'Cinza Sagrado', color: '#546e7a' },
  { id: 'mdf_preto_18mm', label: 'Preto Absoluto', color: '#212121' },
]

export const BRANCO_TX_ID = 'mdf_branco_tx_15mm'
