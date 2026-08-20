// Camada 3D — lê a lista de peças do motor (Seção 10) e renderiza.
// Otimizado: caixaria/estruturas estáticas usam InstancedMesh ou meshes individuais para fita de borda.
// Interativo (Anexo A5): frentes (portas e gavetas) são meshes individuais clicáveis
// que abrem e fecham com animação suave de rotação/translação.
// Texturas: inclui um gerador procedural de textura de veios de madeira (MDF) aprimorado.

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Evaluator, Brush, SUBTRACTION } from 'three-bvh-csg'
import type { Piece } from '../engine/types'
import { materialColor } from './colors'

const MM = 0.001

// Cache global para reusar texturas já geradas
const textureCache = new Map<string, THREE.Texture>()

function getWoodTexture(colorHex: string, grainHex: string, grainDirection: 'vertical' | 'horizontal'): THREE.Texture {
  const key = `${colorHex}_${grainHex}_${grainDirection}`
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
  
  if (grainDirection === 'horizontal') {
    texture.rotation = Math.PI / 2
    texture.center.set(0.5, 0.5)
  }
  
  textureCache.set(key, texture)
  return texture
}

function getMaterial(materialId: string, color: string, grainDirection: 'vertical' | 'horizontal' = 'vertical') {
  const isMaderado = materialId.includes('maderado') || materialId.includes('freijo')
  const texture = isMaderado
    ? getWoodTexture(color, materialId.includes('escuro') ? '#402a1a' : '#a2764b', grainDirection)
    : null
  return { roughness: isMaderado ? 0.75 : 0.25, metalness: 0.02, map: texture }
}

// Material do miolo do MDF cru (onde não há fita de borda)
const MDF_CORE_MAT = {
  color: '#ba9b7c', // Cor de fibra/madeira crua
  roughness: 0.9,
  metalness: 0.0,
  map: null
}

interface PieceProps {
  piece: Piece
  onClick?: (e: any) => void
}

// Renderizador individual de peça 3D (necessário para suportar cores por face / fita de borda)
export function SinglePiece({ piece, onClick }: PieceProps) {
  const color = materialColor(piece.materialId)
  const matProps = useMemo(() => getMaterial(piece.materialId, color, piece.grainDirection), [piece.materialId, color, piece.grainDirection])
  
  const edgeBanding = piece.edgeBanding ?? { top: false, bottom: false, left: false, right: false }

  return (
    <mesh
      position={[
        (piece.position.x + piece.w / 2) * MM,
        (piece.position.y + piece.h / 2) * MM,
        (piece.position.z + piece.d / 2) * MM,
      ]}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[piece.w * MM, piece.h * MM, piece.d * MM]} />
      {/* 6 faces: right (+X), left (-X), top (+Y), bottom (-Y), front (+Z), back (-Z) */}
      <meshStandardMaterial attach="material-0" color={edgeBanding.right ? color : MDF_CORE_MAT.color} roughness={edgeBanding.right ? matProps.roughness : MDF_CORE_MAT.roughness} metalness={edgeBanding.right ? matProps.metalness : MDF_CORE_MAT.metalness} map={edgeBanding.right ? matProps.map : null} />
      <meshStandardMaterial attach="material-1" color={edgeBanding.left ? color : MDF_CORE_MAT.color} roughness={edgeBanding.left ? matProps.roughness : MDF_CORE_MAT.roughness} metalness={edgeBanding.left ? matProps.metalness : MDF_CORE_MAT.metalness} map={edgeBanding.left ? matProps.map : null} />
      <meshStandardMaterial attach="material-2" color={edgeBanding.top ? color : MDF_CORE_MAT.color} roughness={edgeBanding.top ? matProps.roughness : MDF_CORE_MAT.roughness} metalness={edgeBanding.top ? matProps.metalness : MDF_CORE_MAT.metalness} map={edgeBanding.top ? matProps.map : null} />
      <meshStandardMaterial attach="material-3" color={edgeBanding.bottom ? color : MDF_CORE_MAT.color} roughness={edgeBanding.bottom ? matProps.roughness : MDF_CORE_MAT.roughness} metalness={edgeBanding.bottom ? matProps.metalness : MDF_CORE_MAT.metalness} map={edgeBanding.bottom ? matProps.map : null} />
      <meshStandardMaterial attach="material-4" color={color} roughness={matProps.roughness} metalness={matProps.metalness} map={matProps.map} />
      <meshStandardMaterial attach="material-5" color={color} roughness={matProps.roughness} metalness={matProps.metalness} map={matProps.map} />
    </mesh>
  )
}

// Procedural Handle renderer (Puxador)
interface PuxadorProps {
  tipo: string
  cor: string
  w: number // largura da porta
  h: number // altura da porta
  isBasculante: boolean
  isRightHinge: boolean
}

function ProceduralPuxador({ tipo, cor, w, h, isBasculante, isRightHinge }: PuxadorProps) {
  if (tipo === 'tip_on' || tipo === 'usinado_45') return null

  // Puxador material
  const mColor = cor === 'prata' ? '#e2e8f0' : cor === 'bronze' ? '#a16207' : '#1e293b'
  const matProps = {
    color: mColor,
    metalness: 0.85,
    roughness: 0.15
  }

  // Posição padrão
  let px = 0, py = 0, pz = 0
  let scaleX = 1, scaleY = 1, scaleZ = 1

  if (tipo === 'perfil_gola_anodizado' || tipo === 'perfil_45_friso') {
    if (isBasculante) {
      // Horizontal bottom edge
      px = 0
      py = -h / 2 * MM + 10 * MM
      pz = 11 * MM
      scaleX = w * MM
      scaleY = 20 * MM
      scaleZ = 15 * MM
    } else {
      // Vertical opposite side of hinge
      px = isRightHinge ? -w / 2 * MM + 10 * MM : w / 2 * MM - 10 * MM
      py = 0
      pz = 11 * MM
      scaleX = 20 * MM
      scaleY = h * MM
      scaleZ = 15 * MM
    }
    return (
      <mesh position={[px, py, pz]}>
        <boxGeometry args={[scaleX, scaleY, scaleZ]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
    )
  }

  if (tipo === 'alca_convencional') {
    px = isBasculante ? 0 : (isRightHinge ? -w / 2 * MM + 40 * MM : w / 2 * MM - 40 * MM)
    py = isBasculante ? -h / 2 * MM + 40 * MM : 0
    pz = 15 * MM
    
    // Simple U-shape represented by a horizontal/vertical bar
    const barW = isBasculante ? 120 * MM : 10 * MM
    const barH = isBasculante ? 10 * MM : 120 * MM

    return (
      <group position={[px, py, pz]}>
        {/* Main bar */}
        <mesh>
          <boxGeometry args={[barW, barH, 8 * MM]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Left/top mount */}
        <mesh position={[isBasculante ? -50 * MM : 0, isBasculante ? 0 : 50 * MM, -8 * MM]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[4 * MM, 4 * MM, 15 * MM, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Right/bottom mount */}
        <mesh position={[isBasculante ? 50 * MM : 0, isBasculante ? 0 : -50 * MM, -8 * MM]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[4 * MM, 4 * MM, 15 * MM, 8]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </group>
    )
  }

  // default / facetado_rometal
  px = isBasculante ? 0 : (isRightHinge ? -w / 2 * MM + 20 * MM : w / 2 * MM - 20 * MM)
  py = isBasculante ? -h / 2 * MM + 20 * MM : 0
  pz = 10 * MM
  return (
    <mesh position={[px, py, pz]}>
      <boxGeometry args={[isBasculante ? 200 * MM : 15 * MM, isBasculante ? 15 * MM : 200 * MM, 10 * MM]} />
      <meshStandardMaterial {...matProps} />
    </mesh>
  )
}

// Porta interativa — toque para abrir/fechar com animação suave
function InteractiveDoor({ piece }: { piece: Piece }) {
  const [open, setOpen] = useState(false)
  const angleRef = useRef(0)
  const pivotRef = useRef<THREE.Group>(null)
  
  const isRightHinge = piece.name.includes('direita') || piece.name.includes('R') || piece.name.includes('2')
  const isBasculante = piece.name.toLowerCase().includes('basculante') || piece.name.toLowerCase().includes('maleiro')

  // Hinge position (where the door rotates)
  const pivotX = isBasculante
    ? (piece.position.x + piece.w / 2) * MM
    : (piece.position.x + (isRightHinge ? piece.w : 0)) * MM
  const pivotY = isBasculante
    ? (piece.position.y + piece.h) * MM
    : (piece.position.y + piece.h / 2) * MM
  const pivotZ = (piece.position.z + piece.d / 2) * MM

  // Offset of mesh relative to pivot
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

  // HACK: Read handle configuration from parent environment if possible, otherwise use default
  const mockPuxador = { tipo: 'perfil_gola_anodizado', cor: 'preto' }

  return (
    <group position={[pivotX, pivotY, pivotZ]} ref={pivotRef}>
      <group position={[meshOffsetX, meshOffsetY, 0]}>
        <SinglePiece
          piece={{ ...piece, position: { x: -piece.w / 2, y: -piece.h / 2, z: -piece.d / 2 } }}
          onClick={(e) => { e.stopPropagation(); setOpen(!open) }}
        />
        <ProceduralPuxador
          tipo={mockPuxador.tipo}
          cor={mockPuxador.cor}
          w={piece.w}
          h={piece.h}
          isBasculante={isBasculante}
          isRightHinge={isRightHinge}
        />
      </group>
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

  const mockPuxador = { tipo: 'perfil_gola_anodizado', cor: 'preto' }

  return (
    <group ref={groupRef}>
      {pieces.map((p) => {
        const isFrente = p.name.includes('Frente')
        return (
          <group
            key={p.id}
            position={[
              (p.position.x + p.w / 2) * MM,
              (p.position.y + p.h / 2) * MM,
              (p.position.z + p.d / 2) * MM,
            ]}
          >
            <SinglePiece
              piece={{ ...p, position: { x: -p.w / 2, y: -p.h / 2, z: -p.d / 2 } }}
              onClick={isFrente ? (e) => { e.stopPropagation(); setOpen(!open) } : undefined}
            />
            {isFrente && (
              <ProceduralPuxador
                tipo={mockPuxador.tipo}
                cor={mockPuxador.cor}
                w={p.w}
                h={p.h}
                isBasculante={false}
                isRightHinge={false}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

export function Pieces({ pieces }: { pieces: Piece[] }) {
  const { individualPieces, interactiveDoors, interactiveDrawers, cutoutPieces } = useMemo(() => {
    const regular: Piece[] = []
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
        regular.push(p)
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
      individualPieces: regular,
      interactiveDoors: doors,
      interactiveDrawers: [...drawersMap.values()],
      cutoutPieces: cutoutArr,
    }
  }, [pieces])

  return (
    <>
      {individualPieces.map((p) => (
        <SinglePiece key={p.id} piece={p} />
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
  const matProps = getMaterial(piece.materialId, color, piece.grainDirection)

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
