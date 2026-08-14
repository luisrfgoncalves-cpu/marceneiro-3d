// Camada 3D — lê APENAS a lista de peças do motor (Seção 10).
// Peças idênticas (mesma cor) são renderizadas com uma única InstancedMesh
// reaproveitada, evitando travamento com muitos objetos repetidos.
// Conversão: 1mm -> 0.001m (Three.js trabalha em metros).

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Piece } from '../engine/types'
import { materialColor } from './colors'

const MM = 0.001

interface GroupProps {
  color: string
  pieces: Piece[]
}

function InstancedGroup({ color, pieces }: GroupProps) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = pieces.length
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useLayoutEffect(() => {
    if (!ref.current || count === 0) return
    pieces.forEach((p, i) => {
      dummy.position.set(
        (p.position.x + p.w / 2) * MM,
        (p.position.y + p.h / 2) * MM,
        (p.position.z + p.d / 2) * MM,
      )
      dummy.scale.set(p.w * MM, p.h * MM, p.d * MM)
      dummy.updateMatrix()
      ref.current!.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
    ref.current.computeBoundingSphere()
  }, [pieces, count, dummy])

  if (count === 0) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
    </instancedMesh>
  )
}

export function Pieces({ pieces }: { pieces: Piece[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, Piece[]>()
    for (const p of pieces) {
      const color = materialColor(p.materialId)
      const arr = map.get(color) ?? []
      arr.push(p)
      map.set(color, arr)
    }
    return [...map.entries()]
  }, [pieces])

  return (
    <>
      {groups.map(([color, group]) => (
        <InstancedGroup key={color} color={color} pieces={group} />
      ))}
    </>
  )
}
