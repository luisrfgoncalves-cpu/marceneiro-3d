// Camada 3D — lê a lista de peças do motor (Seção 10) e renderiza.
// Otimizado: caixaria/estruturas estáticas usam InstancedMesh.
// Interativo (Anexo A5): frentes (portas e gavetas) são meshes individuais clicáveis
// que abrem e fecham com animação suave de rotação/translação.
// Texturas: inclui um gerador procedural de textura de veios de madeira (MDF) aprimorado.

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'
import type { Piece } from '../engine/types'
import { materialColor } from './colors'

const MM = 0.001

// Cache global para reusar texturas já geradas
const textureCache = new Map<string, THREE.Texture>()

function getWoodTexture(colorHex: string, grainHex: string): THREE.Texture {
  const key = `${colorHex}_${grainHex}`
  if (textureCache.has(key)) return textureCache.get(key)!

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  // Cor base
  ctx.fillStyle = colorHex
  ctx.fillRect(0, 0, 512, 512)

  // Veios principais
  ctx.strokeStyle = grainHex
  ctx.lineWidth = 1.6
  ctx.globalAlpha = 0.15
  for (let i = 0; i < 45; i++) {
    ctx.beginPath()
    const x = Math.random() * 512
    ctx.moveTo(x, 0)
    ctx.bezierCurveTo(x + 30, 160, x - 30, 340, x + 10, 512)
    ctx.stroke()
  }

  // Micro veios de ruído de madeira real
  ctx.strokeStyle = grainHex
  ctx.lineWidth = 0.8
  ctx.globalAlpha = 0.08
  for (let i = 0; i < 80; i++) {
    ctx.beginPath()
    const x = Math.random() * 512
    ctx.moveTo(x, 0)
    ctx.lineTo(x + (Math.random() * 10 - 5), 512)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(1.5, 3)
  textureCache.set(key, texture)
  return texture
}

function getMaterial(materialId: string, color: string) {
  const isMaderado = materialId.includes('maderado')
  const texture = isMaderado
    ? getWoodTexture(color, materialId.includes('escuro') ? '#402a1a' : '#a2764b')
    : null
  return { roughness: isMaderado ? 0.75 : 0.25, metalness: 0.02, map: texture }
}

interface GroupProps {
  color: string
  materialId: string
  pieces: Piece[]
}

function InstancedGroup({ color, materialId, pieces }: GroupProps) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const count = pieces.length
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const matProps = useMemo(() => getMaterial(materialId, color), [materialId, color])

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
    <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={matProps.roughness}
        metalness={matProps.metalness}
        map={matProps.map}
      />
    </instancedMesh>
  )
}

// Porta interativa — toque para abrir/fechar com animação suave
function InteractiveDoor({ piece }: { piece: Piece }) {
  const [open, setOpen] = useState(false)
  const angleRef = useRef(0)
  const pivotRef = useRef<THREE.Group>(null)
  const color = materialColor(piece.materialId)
  const matProps = useMemo(() => getMaterial(piece.materialId, color), [piece.materialId, color])

  const isRightHinge = piece.name.includes('direita') || piece.name.includes('R') || piece.name.includes('2')
  const isBasculante = piece.name.toLowerCase().includes('basculante') || piece.name.toLowerCase().includes('maleiro')

  // Posição do pivot no mundo (onde ficam as dobradiças)
  const pivotX = isBasculante
    ? (piece.position.x + piece.w / 2) * MM
    : (piece.position.x + (isRightHinge ? piece.w : 0)) * MM
  const pivotY = isBasculante
    ? (piece.position.y + piece.h) * MM
    : (piece.position.y + piece.h / 2) * MM
  const pivotZ = (piece.position.z + piece.d / 2) * MM

  // Offset da mesh em relação ao pivot
  const meshOffsetX = isBasculante ? 0 : (isRightHinge ? -piece.w / 2 : piece.w / 2) * MM
  const meshOffsetY = isBasculante ? -piece.h / 2 * MM : 0

  useFrame((_, delta) => {
    const target = open ? Math.PI * 0.55 : 0
    angleRef.current += (target - angleRef.current) * Math.min(delta * 10, 1)
    if (pivotRef.current) {
      if (isBasculante) {
        pivotRef.current.rotation.x = -angleRef.current
      } else {
        pivotRef.current.rotation.y = isRightHinge ? angleRef.current : -angleRef.current
      }
    }
  })

  return (
    <group position={[pivotX, pivotY, pivotZ]} ref={pivotRef}>
      <mesh
        position={[meshOffsetX, meshOffsetY, 0]}
        onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        castShadow
      >
        <boxGeometry args={[piece.w * MM, piece.h * MM, piece.d * MM]} />
        <meshStandardMaterial color={color} roughness={matProps.roughness} metalness={matProps.metalness} map={matProps.map} />
      </mesh>
    </group>
  )
}

// Gaveta interativa — toque para deslizar para fora
function InteractiveDrawer({ pieces }: { pieces: Piece[] }) {
  const [open, setOpen] = useState(false)
  const zRef = useRef(0)
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    const target = open ? -0.35 : 0
    zRef.current += (target - zRef.current) * Math.min(delta * 10, 1)
    if (groupRef.current) groupRef.current.position.z = zRef.current
  })

  return (
    <group ref={groupRef}>
      {pieces.map((p) => {
        const color = materialColor(p.materialId)
        const isFrente = p.name.includes('Frente')
        const matProps = getMaterial(p.materialId, color)
        return (
          <mesh
            key={p.id}
            position={[
              (p.position.x + p.w / 2) * MM,
              (p.position.y + p.h / 2) * MM,
              (p.position.z + p.d / 2) * MM,
            ]}
            onClick={isFrente ? (e) => { e.stopPropagation(); setOpen(!open) } : undefined}
            castShadow
          >
            <boxGeometry args={[p.w * MM, p.h * MM, p.d * MM]} />
            <meshStandardMaterial color={color} roughness={matProps.roughness} metalness={matProps.metalness} map={matProps.map} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Pieces({ pieces }: { pieces: Piece[] }) {
  const { instancedGroups, interactiveDoors, interactiveDrawers, cutoutPieces } = useMemo(() => {
    const instancedMap = new Map<string, Piece[]>()
    const doors: Piece[] = []
    const drawerPieces: Piece[] = []
    const cutoutArr: Piece[] = []

    for (const p of pieces) {
      if (p.cutouts && p.cutouts.length > 0) {
        cutoutArr.push(p)
      } else if (p.name.includes('Porta') || p.name.includes('Frente maleiro')) {
        doors.push(p)
      } else if (p.name.includes('Gaveta') || p.name.includes('sapateira')) {
        drawerPieces.push(p)
      } else {
        const key = `${p.materialId}__${materialColor(p.materialId)}`
        const arr = instancedMap.get(key) ?? []
        arr.push(p)
        instancedMap.set(key, arr)
      }
    }

    const drawersMap = new Map<number, Piece[]>()
    drawerPieces.forEach((p) => {
      const yKey = Math.round(p.position.y / 20) * 20
      const arr = drawersMap.get(yKey) ?? []
      arr.push(p)
      drawersMap.set(yKey, arr)
    })

    return {
      instancedGroups: [...instancedMap.entries()].map(([key, list]) => {
        const [materialId, color] = key.split('__')
        return { materialId, color, list }
      }),
      interactiveDoors: doors,
      interactiveDrawers: [...drawersMap.values()],
      cutoutPieces: cutoutArr,
    }
  }, [pieces])

  return (
    <>
      {instancedGroups.map((g, i) => (
        <InstancedGroup key={i} color={g.color} materialId={g.materialId} pieces={g.list} />
      ))}
      {interactiveDoors.map((door) => (
        <InteractiveDoor key={door.id} piece={door} />
      ))}
      {interactiveDrawers.map((drawerList, idx) => (
        <InteractiveDrawer key={idx} pieces={drawerList} />
      ))}
      {cutoutPieces.map((p) => (
        <CutoutPiece key={p.id} piece={p} />
      ))}
    </>
  )
}

function CutoutPiece({ piece }: { piece: Piece }) {
  const geom = useMemo(() => {
    const evaluator = new Evaluator()
    const baseGeo = new THREE.BoxGeometry(piece.w * MM, piece.h * MM, piece.d * MM)
    const baseBrush = new Brush(baseGeo)
    baseBrush.updateMatrixWorld()

    let currentBrush: Brush = baseBrush

    if (piece.cutouts) {
      for (const cut of piece.cutouts) {
        const cutGeo = new THREE.BoxGeometry(cut.w * MM, (piece.h + 20) * MM, cut.d * MM)
        const cutBrush = new Brush(cutGeo)
        const localX = ((cut.position.x - piece.position.x) - piece.w / 2) * MM
        const localZ = ((cut.position.z - piece.position.z) - piece.d / 2) * MM
        cutBrush.position.set(localX, 0, localZ)
        cutBrush.updateMatrixWorld()
        currentBrush = evaluator.evaluate(currentBrush, cutBrush, SUBTRACTION) as unknown as Brush
      }
    }
    return currentBrush.geometry
  }, [piece])

  const color = materialColor(piece.materialId)
  const matProps = getMaterial(piece.materialId, color)

  return (
    <mesh
      position={[
        (piece.position.x + piece.w / 2) * MM,
        (piece.position.y + piece.h / 2) * MM,
        (piece.position.z + piece.d / 2) * MM,
      ]}
      castShadow receiveShadow
    >
      <primitive object={geom} attach="geometry" />
      <meshStandardMaterial color={color} roughness={matProps.roughness} metalness={matProps.metalness} map={matProps.map} />
    </mesh>
  )
}

