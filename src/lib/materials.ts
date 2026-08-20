export interface MaterialDef {
  id: string;
  name: string;
  brand: string;
  color: string; // hex
  texture?: string; // 'wood', 'solid', 'fabric', 'stone'
  roughness?: number;
}

export const MATERIAL_CATALOG: MaterialDef[] = [
  // GUARARAPES
  { id: 'gua-freijo', name: 'Freijó', brand: 'Guararapes', color: '#966d4a', texture: 'wood', roughness: 0.8 },
  { id: 'gua-savana', name: 'Savana', brand: 'Guararapes', color: '#6e4f3a', texture: 'wood', roughness: 0.8 },
  { id: 'gua-grafite', name: 'Grafite', brand: 'Guararapes', color: '#4a4a4a', texture: 'solid', roughness: 0.6 },
  { id: 'gua-branco-tx', name: 'Branco TX', brand: 'Guararapes', color: '#f5f5f5', texture: 'solid', roughness: 0.9 },
  { id: 'gua-areia', name: 'Areia', brand: 'Guararapes', color: '#d9cdb8', texture: 'solid', roughness: 0.7 },
  { id: 'gua-nogueira', name: 'Nogueira', brand: 'Guararapes', color: '#523a28', texture: 'wood', roughness: 0.8 },

  // ARAUCO
  { id: 'ara-castanheira', name: 'Castanheira', brand: 'Arauco', color: '#8a6242', texture: 'wood', roughness: 0.8 },
  { id: 'ara-louro-freijo', name: 'Louro Freijó', brand: 'Arauco', color: '#a37c59', texture: 'wood', roughness: 0.8 },
  { id: 'ara-cinza-cristal', name: 'Cinza Cristal', brand: 'Arauco', color: '#cfd1d2', texture: 'solid', roughness: 0.7 },
  { id: 'ara-preto-tx', name: 'Preto TX', brand: 'Arauco', color: '#222222', texture: 'solid', roughness: 0.9 },
  
  // DURATEX
  { id: 'dur-carvalho-hanover', name: 'Carvalho Hanover', brand: 'Duratex', color: '#7a5a40', texture: 'wood', roughness: 0.8 },
  { id: 'dur-titano', name: 'Titânio', brand: 'Duratex', color: '#595a5c', texture: 'solid', roughness: 0.6 },
  { id: 'dur-gianduia', name: 'Gianduia', brand: 'Duratex', color: '#8b7d73', texture: 'solid', roughness: 0.6 },
  { id: 'dur-branco-diamante', name: 'Branco Diamante', brand: 'Duratex', color: '#ffffff', texture: 'solid', roughness: 0.5 },
]

export function getMaterial(id: string): MaterialDef {
  return MATERIAL_CATALOG.find(m => m.id === id) || MATERIAL_CATALOG[3] // Fallback to Branco TX
}

export function getMaterialColor(id: string): string {
  return getMaterial(id).color
}
