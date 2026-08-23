// Sala contextualizada (Fase 4): parede traseira + rodapé + piso com textura CC0.
// Presentação estilo "showroom" dos apps de referência — toggle na UI.

import { useMemo } from 'react'
import { floorTextures } from './textures'

const MM = 0.001
const WALL_H = 2.7 // m

export function Room({ width, depth }: { width: number; depth: number }) {
  const w = Math.max(width * MM, 1) + 1.6
  const d = Math.max(depth * MM, 0.6) + 2.4

  const floorTex = useMemo(() => floorTextures(), [])

  // Repeat do piso proporcional à área (placas ~0.6m)
  useMemo(() => {
    const rx = Math.round(w / 0.6)
    const ry = Math.round(d / 0.6)
    for (const t of [floorTex.map, floorTex.normalMap]) {
      t.repeat.set(rx, ry)
      t.needsUpdate = true
    }
    return null
  }, [w, d, floorTex])

  return (
    <group>
      {/* Piso */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[w / 2 - 0.8, 0, d / 2 - 1.2]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial map={floorTex.map} normalMap={floorTex.normalMap} roughness={0.55} metalness={0.02} />
      </mesh>

      {/* Parede traseira */}
      <mesh position={[w / 2 - 0.8, WALL_H / 2, -1.2]} receiveShadow>
        <planeGeometry args={[w, WALL_H]} />
        <meshStandardMaterial color="#e8e4dd" roughness={0.95} metalness={0} />
      </mesh>

      {/* Rodapé da parede */}
      <mesh position={[w / 2 - 0.8, 0.04, -1.19]}>
        <boxGeometry args={[w, 0.08, 0.02]} />
        <meshStandardMaterial color="#f5f3ef" roughness={0.6} />
      </mesh>
    </group>
  )
}
