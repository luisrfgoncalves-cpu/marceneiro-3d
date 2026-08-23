// Dobradiças 3D (Seção 4.1) — posicionadas na borda da porta conforme lado da dobradiça.
// yMm do motor é medido do topo da porta.

import type { ModuleResult } from '../engine/types'
import { Hinge } from './Hardware'

interface HingePart {
  key: string
  x: number
  y: number
  z: number
  mirror: boolean
}

export function Hinges({ result }: { result: ModuleResult }) {
  const parts: HingePart[] = []
  for (const h of result.hinges) {
    const idx = h.doorId.replace('porta_', '')
    const door = result.pieces.find(
      (pc) => pc.name === `Porta ${idx}` || pc.name.startsWith(`Porta ${idx} `),
    )
    if (!door) continue
    const isRightHinge =
      /direita/i.test(door.name) || /R\d/i.test(door.name.replace('Porta ', ''))
    parts.push({
      key: `${h.doorId}_${Math.round(h.yMm)}`,
      x: isRightHinge ? door.position.x + door.w : door.position.x,
      y: door.position.y + door.h - h.yMm,
      z: door.position.z + door.d + 1,
      mirror: isRightHinge,
    })
  }
  if (parts.length === 0) return null
  return (
    <group>
      {parts.map((pt) => (
        <group key={pt.key} scale={[pt.mirror ? -1 : 1, 1, 1]}>
          <Hinge yPos={pt.y} xPos={pt.x} zPos={pt.z} angle={0} type="reta" />
        </group>
      ))}
    </group>
  )
}
