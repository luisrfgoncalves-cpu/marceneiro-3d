// Usinagens no raio-X (Fase 5): furos de copa das dobradiças (35mm) atravessando
// a face interna da porta — só renderiza quando view.raioX ativo.

import type { ModuleResult } from '../engine/types'

const MM = 0.001

export function Usinagens({ result, offsetX = 0, posZ = 0 }: {
  result: ModuleResult
  offsetX?: number
  posZ?: number
}) {
  const parts: Array<{ key: string; x: number; y: number; z: number; len: number }> = []

  for (const h of result.hinges) {
    const idx = h.doorId.replace('porta_', '')
    const door = result.pieces.find(
      (pc) => pc.name === `Porta ${idx}` || pc.name.startsWith(`Porta ${idx} `),
    )
    if (!door) continue
    const isRightHinge =
      /direita/i.test(door.name) || /R\d/i.test(door.name.replace('Porta ', ''))
    const cupCenterFromEdge = 21 // mm, padrão de furação de copa 35mm
    const x =
      (isRightHinge ? door.position.x + door.w - cupCenterFromEdge : door.position.x + cupCenterFromEdge) +
      offsetX
    parts.push({
      key: `${h.doorId}_${Math.round(h.yMm)}`,
      x,
      y: door.position.y + door.h - h.yMm,
      z: door.position.z + door.d / 2 + posZ,
      len: (door.d + 6) * MM,
    })
  }

  if (parts.length === 0) return null
  return (
    <group>
      {parts.map((pt) => (
        <mesh key={pt.key} position={[pt.x * MM, pt.y * MM, pt.z * MM]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[17.5 * MM, 17.5 * MM, pt.len, 20]} />
          <meshStandardMaterial color="#14161b" roughness={0.55} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
