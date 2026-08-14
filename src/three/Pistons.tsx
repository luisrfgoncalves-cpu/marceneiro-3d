// Pistões a gás (Seção 4.4) — cilindros finos na lateral das portas basculantes.

import type { ModuleResult } from '../engine/types'

export function Pistons({ result }: { result: ModuleResult }) {
  const parts: Array<{ key: string; x: number; y: number; z: number }> = []
  for (const p of result.pistons) {
    const idx = p.doorId.replace('porta_', '')
    const door = result.pieces.find((pc) => pc.name === `Porta ${idx}`)
    if (!door) continue
    parts.push({
      key: p.doorId,
      x: (door.position.x + door.w / 2) / 1000,
      y: p.yMm / 1000,
      z: (door.position.z + door.d) / 1000 + 0.02,
    })
  }
  if (parts.length === 0) return null
  return (
    <group>
      {parts.map((pt) => (
        <mesh key={pt.key} position={[pt.x, pt.y, pt.z]}>
          <cylinderGeometry args={[0.007, 0.007, 0.22, 10]} />
          <meshStandardMaterial color="#9aa0ad" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
