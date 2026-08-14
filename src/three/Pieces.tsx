// Camada 3D — lê APENAS a lista de peças do motor (Seção 10).
// Peças idênticas (mesma cor) são renderizadas com uma única InstancedMesh
// reaproveitada, evitando travamento com muitos objetos repetidos.
// Conversão: 1mm -> 0.001m (Three.js trabalha em metros).

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'
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

function CutoutPiece({ piece }: { piece: Piece }) {
  const geom = useMemo(() => {
    const evaluator = new Evaluator()
    const baseGeo = new THREE.BoxGeometry(piece.w * MM, piece.h * MM, piece.d * MM)
    const baseBrush = new Brush(baseGeo)
    baseBrush.updateMatrixWorld()

    let currentBrush = baseBrush

    if (piece.cutouts) {
      for (const cut of piece.cutouts) {
        // Geometria de corte (com altura maior para atravessar)
        const cutGeo = new THREE.BoxGeometry(cut.w * MM, (piece.h + 20) * MM, cut.d * MM)
        const cutBrush = new Brush(cutGeo)
        const localX = (cut.position.x - piece.position.x) - piece.w / 2
        const localY = 0
        const localZ = (cut.position.z - piece.position.z) - piece.d / 2

        cutBrush.position.set(localX * MM, localY * MM, localZ * MM)
        cutBrush.updateMatrixWorld()

        currentBrush = evaluator.evaluate(currentBrush, cutBrush, SUBTRACTION) as any
      }
    }
    return currentBrush.geometry
  }, [piece])

  const color = materialColor(piece.materialId)

  return (
    <mesh
      position={[
        (piece.position.x + piece.w / 2) * MM,
        (piece.position.y + piece.h / 2) * MM,
        (piece.position.z + piece.d / 2) * MM,
      ]}
    >
      <primitive object={geom} attach="geometry" />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  )
}

export function Pieces({ pieces }: { pieces: Piece[] }) {
  const { instancedGroups, cutoutPieces } = useMemo(() => {
    const instancedMap = new Map<string, Piece[]>()
    const cutoutArr: Piece[] = []

    for (const p of pieces) {
      if (p.cutouts && p.cutouts.length > 0) {
        cutoutArr.push(p)
      } else {
        const color = materialColor(p.materialId)
        const arr = instancedMap.get(color) ?? []
        arr.push(p)
        instancedMap.set(color, arr)
      }
    }

    return {
      instancedGroups: [...instancedMap.entries()],
      cutoutPieces: cutoutArr,
    }
  }, [pieces])

  return (
    <>
      {instancedGroups.map(([color, group]) => (
        <InstancedGroup key={color} color={color} pieces={group} />
      ))}
      {cutoutPieces.map((p) => (
        <CutoutPiece key={p.id} piece={p} />
      ))}
    </>
  )
}
