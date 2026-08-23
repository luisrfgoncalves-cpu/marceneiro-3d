// Texturas PBR CC0 (Poly Haven) em public/textures — madeiras com albedo+normal.
// Materiais lisos continuam cores sólidas do catálogo. Fallback: gerador procedural.

import * as THREE from 'three'

const cache = new Map<string, THREE.Texture>()

function loadTex(file: string, srgb: boolean): THREE.Texture {
  const key = `${file}|${srgb}`
  if (cache.has(key)) return cache.get(key)!
  const tex = new THREE.TextureLoader().load(`/textures/${file}`)
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

interface WoodDef {
  file: string
  normal?: string
  tint?: string
  roughness?: number
}

// 4 granulações distintas cobrem o catálogo madierado (tints sutis diferenciam tons)
const WOODS: Record<string, WoodDef> = {
  'gua-freijo': { file: 'oak_veneer_01_diff.jpg', normal: 'oak_veneer_01_nor_gl.jpg', tint: '#e8d3bd', roughness: 0.75 },
  'dur-carvalho-hanover': { file: 'oak_veneer_01_diff.jpg', normal: 'oak_veneer_01_nor_gl.jpg', tint: '#dcc0a4', roughness: 0.75 },
  'ara-louro-freijo': { file: 'laminate_floor_02_diff.jpg', tint: '#e6c9a8', roughness: 0.7 },
  'gua-nogueira': { file: 'wood_table_001_diff.jpg', normal: 'wood_table_001_nor_gl.jpg', tint: '#d9c3ab', roughness: 0.7 },
  'ara-castanheira': { file: 'wood_table_001_diff.jpg', normal: 'wood_table_001_nor_gl.jpg', tint: '#cdb096', roughness: 0.75 },
  'gua-savana': { file: 'weathered_brown_planks_diff.jpg', normal: 'weathered_brown_planks_nor_gl.jpg', tint: '#cbb19a', roughness: 0.8 },
}

export interface PbrProps {
  color: string
  map: THREE.Texture
  normalMap?: THREE.Texture
  roughness: number
  metalness: number
}

/** Props PBR para materiais madeirados; null quando o catálogo é liso (usa cor sólida). */
export function pbrFor(materialId: string): PbrProps | null {
  const def = WOODS[materialId]
  if (!def) return null
  return {
    color: def.tint ?? '#ffffff',
    map: loadTex(def.file, true),
    normalMap: def.normal ? loadTex(def.normal, false) : undefined,
    roughness: def.roughness ?? 0.75,
    metalness: 0.02,
  }
}

/** Textura do piso da sala (Room). */
export function floorTextures(): { map: THREE.Texture; normalMap: THREE.Texture } {
  const map = loadTex('wood_floor_deck_diff.jpg', true)
  const normalMap = loadTex('wood_floor_deck_nor_gl.jpg', false)
  for (const t of [map, normalMap]) {
    t.repeat.set(Math.max(2, 8), Math.max(2, 8))
  }
  return { map, normalMap }
}
