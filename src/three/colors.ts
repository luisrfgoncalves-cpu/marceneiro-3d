// src/three/colors.ts
// Mapa de cores para o preview 3D.
// Atualizado com paleta premium de alta fidelidade das marcas brasileiras (Duratex, Guararapes, Arauco).

export const MATERIAL_COLORS: Record<string, string> = {
  mdf_branco_tx_15mm: '#f5f2eb', // Branco Diamante (Duratex) - Off-white leve e fosco
  mdf_branco_tx_18mm: '#f5f2eb', // Branco Diamante (Duratex) - Off-white leve e fosco
  mdf_maderado_x_18mm: '#d4aa7d', // Carvalho Mel (Guararapes) - Madeirado mel aconchegante
  mdf_maderado_escuro_18mm: '#5a4233', // Nobre Nogueira (Guararapes) - Nogueira escura elegante
  mdf_cinza_18mm: '#546e7a', // Cinza Sagrado (Guararapes) - Cinza grafite fosco sofisticado
  mdf_preto_18mm: '#212121', // Preto Carbono (Duratex) - Preto absoluto matte
  mdf_louro_freijo_18mm: '#ac8152', // Louro Freijó (Arauco) - Madeirado freijó clássico
  // Pedras naturais — cores realistas para tampos de cozinha
  pedra_granito_nero_absolute: '#1a1a1a',       // Granito Preto Absoluto
  pedra_marmore_bianco_carrara: '#f0ede8',       // Mármore Branco Carrara
  pedra_quartzito_arabescato: '#e8d9c4',         // Quartzito Arabescato bege
  pedra_silestone_cinza_expo: '#6b7280',         // Silestone Cinza Expo
  pedra_porcelana_beton_light: '#c4bfb5',        // Porcelana Beton Light
  mdf_areia_18mm: '#e5ded4', // Areia Cores (Guararapes) - Areia clássico
}

export function materialColor(materialId: string): string {
  return MATERIAL_COLORS[materialId] ?? '#d4aa7d'
}

export interface Swatch {
  id: string
  label: string
  color: string
  description?: string
}

export const COLOR_SWATCHES: Swatch[] = [
  { id: 'mdf_branco_tx_18mm', label: 'Branco Diamante', color: '#f5f2eb', description: 'Essencial Duratex (Branco TX)' },
  { id: 'mdf_areia_18mm', label: 'Areia Guararapes', color: '#e5ded4', description: 'Linha Cores Guararapes' },
  { id: 'mdf_maderado_x_18mm', label: 'Carvalho Mel', color: '#d4aa7d', description: 'Madeirado Guararapes' },
  { id: 'mdf_louro_freijo_18mm', label: 'Louro Freijó', color: '#ac8152', description: 'Madeirado Arauco' },
  { id: 'mdf_maderado_escuro_18mm', label: 'Nobre Nogueira', color: '#5a4233', description: 'Linha Madeiras Guararapes' },
  { id: 'mdf_cinza_18mm', label: 'Cinza Sagrado', color: '#546e7a', description: 'Premium Guararapes' },
  { id: 'mdf_preto_18mm', label: 'Preto Carbono', color: '#212121', description: 'Design Duratex' },
]

export const BRANCO_TX_ID = 'mdf_branco_tx_15mm'
