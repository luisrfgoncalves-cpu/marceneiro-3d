// Kit de decoração low-poly (Fase 4) — 12 objetos procedurais three.js puros.
// Zero downloads/licenças, bundle mínimo. Footprints em mm para hitbox/gizmo.

import * as THREE from 'three'
import type { DecorTipo } from '../engine/environment'

export const DECOR_CATALOG: Array<{ tipo: DecorTipo; label: string }> = [
  { tipo: 'planta', label: 'Planta' },
  { tipo: 'geladeira', label: 'Geladeira' },
  { tipo: 'fogao', label: 'Fogão' },
  { tipo: 'lava_roupas', label: 'Lava-roupas' },
  { tipo: 'sofa', label: 'Sofá' },
  { tipo: 'cama', label: 'Cama' },
  { tipo: 'tapete', label: 'Tapete' },
  { tipo: 'tv', label: 'TV + rack' },
  { tipo: 'luminaria', label: 'Luminária' },
  { tipo: 'micro_ondas', label: 'Micro-ondas' },
  { tipo: 'mesa', label: 'Mesa' },
  { tipo: 'cadeira', label: 'Cadeira' },
]

/** Footprint aproximado (mm) por tipo — usado no clique e no gizmo. */
export const DECOR_SIZE: Record<DecorTipo, { w: number; d: number; h: number }> = {
  planta: { w: 400, d: 400, h: 1400 },
  geladeira: { w: 750, d: 720, h: 1850 },
  fogao: { w: 760, d: 650, h: 950 },
  lava_roupas: { w: 620, d: 620, h: 880 },
  sofa: { w: 1900, d: 900, h: 800 },
  cama: { w: 1650, d: 2100, h: 1000 },
  tapete: { w: 2000, d: 1400, h: 20 },
  tv: { w: 1600, d: 420, h: 1300 },
  luminaria: { w: 380, d: 380, h: 1550 },
  micro_ondas: { w: 520, d: 400, h: 320 },
  mesa: { w: 1500, d: 850, h: 760 },
  cadeira: { w: 460, d: 500, h: 900 },
}

const M = {
  inox: { color: '#c9ccd2', metalness: 0.85, roughness: 0.25 },
  branco: { color: '#f2f2f0', metalness: 0.05, roughness: 0.4 },
  preto: { color: '#1c1e22', metalness: 0.3, roughness: 0.35 },
  cinza: { color: '#5a5f68', metalness: 0.1, roughness: 0.7 },
  tecido: { color: '#7d8ba1', metalness: 0, roughness: 0.95 },
  tecidoEscuro: { color: '#4b5568', metalness: 0, roughness: 0.95 },
  madeira: { color: '#a07a52', metalness: 0, roughness: 0.75 },
  madeiraEscura: { color: '#5f4630', metalness: 0, roughness: 0.75 },
  verde: { color: '#4a7c47', metalness: 0, roughness: 0.9 },
  verdeClaro: { color: '#6fa05e', metalness: 0, roughness: 0.9 },
  terracota: { color: '#b06a4a', metalness: 0, roughness: 0.8 },
}

export function DecorObject({ tipo }: { tipo: DecorTipo }) {
  switch (tipo) {
    case 'planta':
      return (
        <group>
          <mesh position={[0, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.11, 0.32, 16]} />
            <meshStandardMaterial {...M.terracota} />
          </mesh>
          <mesh position={[0, 0.72, 0]} castShadow>
            <sphereGeometry args={[0.26, 12, 10]} />
            <meshStandardMaterial {...M.verde} />
          </mesh>
          <mesh position={[0.08, 1.02, -0.04]} castShadow>
            <sphereGeometry args={[0.17, 10, 8]} />
            <meshStandardMaterial {...M.verdeClaro} />
          </mesh>
          <mesh position={[-0.09, 0.94, 0.06]} castShadow>
            <sphereGeometry args={[0.14, 10, 8]} />
            <meshStandardMaterial {...M.verde} />
          </mesh>
        </group>
      )

    case 'geladeira':
      return (
        <group>
          <mesh position={[0, 0.925, 0]} castShadow>
            <boxGeometry args={[0.75, 1.85, 0.7]} />
            <meshStandardMaterial {...M.inox} />
          </mesh>
          <mesh position={[0, 1.55, 0.36]}>
            <boxGeometry args={[0.73, 0.58, 0.02]} />
            <meshStandardMaterial {...M.inox} />
          </mesh>
          <mesh position={[0.3, 1.35, 0.37]} castShadow>
            <boxGeometry args={[0.03, 0.5, 0.04]} />
            <meshStandardMaterial {...M.cinza} />
          </mesh>
          <mesh position={[0.3, 0.62, 0.37]} castShadow>
            <boxGeometry args={[0.03, 0.7, 0.04]} />
            <meshStandardMaterial {...M.cinza} />
          </mesh>
        </group>
      )

    case 'fogao':
      return (
        <group>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.76, 0.9, 0.65]} />
            <meshStandardMaterial {...M.branco} />
          </mesh>
          <mesh position={[0, 0.91, 0]}>
            <boxGeometry args={[0.76, 0.03, 0.65]} />
            <meshStandardMaterial {...M.preto} />
          </mesh>
          {[[-0.18, -0.15], [0.18, -0.15], [-0.18, 0.15], [0.18, 0.15]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.935, z]}>
              <cylinderGeometry args={[0.07, 0.07, 0.012, 16]} />
              <meshStandardMaterial {...M.preto} />
            </mesh>
          ))}
          <mesh position={[0, 0.42, 0.33]}>
            <boxGeometry args={[0.66, 0.5, 0.01]} />
            <meshStandardMaterial {...M.cinza} />
          </mesh>
        </group>
      )

    case 'lava_roupas':
      return (
        <group>
          <mesh position={[0, 0.44, 0]} castShadow>
            <boxGeometry args={[0.62, 0.88, 0.62]} />
            <meshStandardMaterial {...M.branco} />
          </mesh>
          <mesh position={[0, 0.48, 0.315]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.02, 24]} />
            <meshStandardMaterial {...M.cinza} />
          </mesh>
          <mesh position={[0, 0.78, 0.315]}>
            <boxGeometry args={[0.5, 0.09, 0.02]} />
            <meshStandardMaterial {...M.cinza} />
          </mesh>
        </group>
      )

    case 'sofa':
      return (
        <group>
          <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.9, 0.35, 0.9]} />
            <meshStandardMaterial {...M.tecido} />
          </mesh>
          <mesh position={[0, 0.62, -0.33]} castShadow>
            <boxGeometry args={[1.9, 0.55, 0.22]} />
            <meshStandardMaterial {...M.tecido} />
          </mesh>
          {[-0.86, 0.86].map((x, i) => (
            <mesh key={i} position={[x, 0.55, 0]} castShadow>
              <boxGeometry args={[0.18, 0.55, 0.9]} />
              <meshStandardMaterial {...M.tecidoEscuro} />
            </mesh>
          ))}
          {[-0.42, 0.42].map((x, i) => (
            <mesh key={`c${i}`} position={[x, 0.51, 0.06]} castShadow>
              <boxGeometry args={[0.8, 0.14, 0.72]} />
              <meshStandardMaterial {...M.tecidoEscuro} />
            </mesh>
          ))}
        </group>
      )

    case 'cama':
      return (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.65, 0.44, 2.1]} />
            <meshStandardMaterial {...M.madeiraEscura} />
          </mesh>
          <mesh position={[0, 0.56, 0.05]} castShadow>
            <boxGeometry args={[1.58, 0.24, 2.0]} />
            <meshStandardMaterial {...M.branco} />
          </mesh>
          <mesh position={[0, 0.74, 0.05]} castShadow>
            <boxGeometry args={[1.5, 0.12, 1.3]} />
            <meshStandardMaterial {...M.tecido} />
          </mesh>
          {[-0.38, 0.38].map((x, i) => (
            <mesh key={i} position={[x, 0.7, -0.72]} rotation={[0.18, 0, 0]} castShadow>
              <boxGeometry args={[0.6, 0.12, 0.38]} />
              <meshStandardMaterial {...M.branco} />
            </mesh>
          ))}
          <mesh position={[0, 0.75, -1.06]} castShadow>
            <boxGeometry args={[1.65, 0.9, 0.09]} />
            <meshStandardMaterial {...M.madeiraEscura} />
          </mesh>
        </group>
      )

    case 'tapete':
      return (
        <mesh position={[0, 0.012, 0]} receiveShadow>
          <boxGeometry args={[2.0, 0.022, 1.4]} />
          <meshStandardMaterial color="#8a8578" roughness={1} metalness={0} />
        </mesh>
      )

    case 'tv':
      return (
        <group>
          <mesh position={[0, 0.22, 0]} castShadow>
            <boxGeometry args={[1.6, 0.42, 0.42]} />
            <meshStandardMaterial {...M.madeira} />
          </mesh>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[1.35, 0.78, 0.05]} />
            <meshStandardMaterial {...M.preto} />
          </mesh>
          <mesh position={[0, 0.85, 0.031]}>
            <planeGeometry args={[1.27, 0.71]} />
            <meshStandardMaterial color="#101828" roughness={0.2} metalness={0.6} />
          </mesh>
        </group>
      )

    case 'luminaria':
      return (
        <group>
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.18, 0.04, 20]} />
            <meshStandardMaterial {...M.preto} />
          </mesh>
          <mesh position={[0, 0.75, 0]} castShadow>
            <cylinderGeometry args={[0.015, 0.015, 1.5, 8]} />
            <meshStandardMaterial {...M.preto} />
          </mesh>
          <mesh position={[0, 1.62, 0]} castShadow>
            <coneGeometry args={[0.22, 0.28, 20, 1, true]} />
            <meshStandardMaterial color="#efe8da" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )

    case 'micro_ondas':
      return (
        <group>
          <mesh position={[0, 0.16, 0]} castShadow>
            <boxGeometry args={[0.52, 0.3, 0.4]} />
            <meshStandardMaterial {...M.inox} />
          </mesh>
          <mesh position={[0, 0.16, 0.205]}>
            <boxGeometry args={[0.38, 0.22, 0.005]} />
            <meshStandardMaterial {...M.preto} />
          </mesh>
        </group>
      )

    case 'mesa':
      return (
        <group>
          <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.05, 0.85]} />
            <meshStandardMaterial {...M.madeira} />
          </mesh>
          {[[-0.68, -0.35], [0.68, -0.35], [-0.68, 0.35], [0.68, 0.35]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.36, z]} castShadow>
              <boxGeometry args={[0.06, 0.72, 0.06]} />
              <meshStandardMaterial {...M.madeiraEscura} />
            </mesh>
          ))}
        </group>
      )

    case 'cadeira':
      return (
        <group>
          <mesh position={[0, 0.45, 0]} castShadow>
            <boxGeometry args={[0.46, 0.05, 0.46]} />
            <meshStandardMaterial {...M.madeira} />
          </mesh>
          <mesh position={[0, 0.72, -0.21]} rotation={[-0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.46, 0.5, 0.05]} />
            <meshStandardMaterial {...M.madeira} />
          </mesh>
          {[[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.22, z]} castShadow>
              <boxGeometry args={[0.04, 0.44, 0.04]} />
              <meshStandardMaterial {...M.madeiraEscura} />
            </mesh>
          ))}
        </group>
      )
  }
}
