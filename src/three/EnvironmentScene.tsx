// Cena do ambiente completo (Seção 11.7) — interação nível SaaS:
// seleção por clique, gizmo de arraste X/Z (híbrido), sala contextualizada,
// decoração low-poly, cotas no 3D, raio-x, arestas, colisão, explosão e captura PNG.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Grid, ContactShadows, Html, Line, CameraControls, TransformControls, Environment } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { DecorItem, PlacedModule, PlacedPiece } from '../engine/environment'
import { Pieces } from './Pieces'
import { GlCapture } from './GlCapture'
import { Fx, HIGH_PERF } from './Fx'
import { Room } from './Room'
import { Hinges } from './Hinges'
import { Usinagens } from './Usinagens'
import { DECOR_SIZE, DecorObject } from './decor'
import { captureScreenshot } from '../lib/screenshot'
import { useEnvStore } from '../state/envStore'
import { Camera, Eye, EyeOff, Scan, Box, Ruler, House } from 'lucide-react'

const MM = 0.001

export interface EnvEditorHandlers {
  onModuleFreeMove: (id: string, posX: number, posZ: number) => void
  onDecorMove: (id: string, x: number, z: number) => void
}

interface EnvSceneProps {
  pieces: PlacedPiece[]
  placed: PlacedModule[]
  decoracoes: DecorItem[]
  totalWidth: number
  depth: number
  heights: Record<string, number>
  collisionIds: Set<string>
  readOnly?: boolean
  screenshotName?: string
  explode?: number
  onPieceSelect?: (moduleId: string | null, pieceName?: string) => void
  handlers?: EnvEditorHandlers
}

function Outline({ x0, x1, height, depth, color }: {
  x0: number
  x1: number
  height: number
  depth: number
  color: string
}) {
  const w = Math.max((x1 - x0) * MM, 0.01)
  const geom = useMemo(() => new THREE.BoxGeometry(w, Math.max(height * MM, 0.01), Math.max(depth * MM, 0.01)), [w, height, depth])
  return (
    <lineSegments position={[((x0 + x1) / 2) * MM, (height * MM) / 2, (depth * MM) / 2]}>
      <primitive object={new THREE.EdgesGeometry(geom)} attach="geometry" />
      <lineBasicMaterial color={color} transparent opacity={0.95} />
    </lineSegments>
  )
}

/** Gizmo de arraste X/Z com snap 5mm — commit relativo ao centro atual. */
function DragGizmo({ center, onCommit }: {
  center: [number, number, number]
  onCommit: (dxMm: number, dzMm: number) => void
}) {
  const obj = useMemo(() => new THREE.Object3D(), [])
  const dragging = useRef(false)

  useEffect(() => {
    if (!dragging.current) obj.position.set(center[0], center[1], center[2])
  }, [center[0], center[1], center[2], obj])

  return (
    <>
      <primitive object={obj} />
      <TransformControls
        object={obj}
        showY={false}
        size={0.85}
        translationSnap={0.005}
        onMouseDown={() => {
          dragging.current = true
        }}
        onMouseUp={() => {
          dragging.current = false
          const dx = Math.round(obj.position.x / MM) - center[0]
          const dz = Math.round(obj.position.z / MM) - center[2]
          obj.position.set(center[0], center[1], center[2])
          if (Math.abs(dx) > 1 || Math.abs(dz) > 1) onCommit(dx, dz)
        }}
      />
    </>
  )
}

export function EnvironmentScene({
  pieces,
  placed,
  decoracoes,
  totalWidth,
  depth,
  heights,
  collisionIds,
  readOnly = false,
  screenshotName = 'ambiente',
  explode = 0,
  onPieceSelect,
  handlers,
}: EnvSceneProps) {
  const selectedId = useEnvStore((s) => s.selectedId)
  const select = useEnvStore((s) => s.select)
  const view = useEnvStore((s) => s.view)

  const w = Math.max(totalWidth * MM, 1)
  const d = Math.max(depth * MM, 0.6)
  const cx = w / 2
  const cz = d / 2
  const cameraDist = Math.max(w, d) * 0.9 + 2

  const controlsRef = useRef<CameraControls>(null!)
  const glRef = useRef<THREE.WebGLRenderer | null>(null)
  const [, force] = useState(0)
  const onGlReady = useCallback((gl: THREE.WebGLRenderer) => {
    glRef.current = gl
    force((n) => n + 1)
  }, [])

  useEffect(() => {
    const c = controlsRef.current
    if (!c) return
    c.minDistance = 0.8
    c.maxDistance = Math.max(w, d) + 14
    c.maxPolarAngle = Math.PI / 2.02
  }, [w, d])

  const fitAll = useCallback(() => {
    const c = controlsRef.current
    if (!c) return
    const box = new THREE.Box3(
      new THREE.Vector3(-0.4, -0.1, -0.6),
      new THREE.Vector3(w + 0.4, Math.max(...Object.values(heights), 800) * MM + 0.3, d + 0.6),
    )
    void c.fitToBox(box, true)
  }, [w, d, heights])

  const handleSelect = useCallback(
    (id: string, pieceName?: string) => {
      if (readOnly) return
      select(id)
      onPieceSelect?.(id, pieceName)
    },
    [readOnly, select, onPieceSelect],
  )

  const handleScreenshot = () => captureScreenshot(glRef.current, `${screenshotName}-3d`)

  const selectedPlaced = placed.find((p) => p.module.id === selectedId)
  const selectedDecor = decoracoes.find((dc) => `decor::${dc.id}` === selectedId)

  const moduleCenters = useMemo(() => {
    const m = new Map<string, { x: number; z: number; h: number }>()
    for (const pm of placed) {
      m.set(pm.module.id, {
        x: pm.offsetX + pm.width / 2,
        z: (pm.depth) / 2 + (Number.isFinite(pm.module.posZ) ? (pm.module.posZ as number) : 0),
        h: heights[pm.module.id] ?? pm.result.dimensions.height,
      })
    }
    return m
  }, [placed, heights])

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [cx + cameraDist * 0.6, cameraDist * 0.8, cz + cameraDist], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        onPointerMissed={() => {
          if (readOnly) return
          select(null)
          onPieceSelect?.(null)
        }}
        onDoubleClick={fitAll}
      >
        <GlCapture onReady={onGlReady} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[6, 10, 7]} intensity={1.15} />
        <directionalLight position={[-6, 4, -4]} intensity={0.35} color="#dbe4ff" />
        {HIGH_PERF && <Environment preset="apartment" />}

        {view.sala && <Room width={totalWidth + 400} depth={depth + 400} />}

        <Pieces
          pieces={pieces}
          onSelectModule={handleSelect}
          hideFrentes={!view.frentes}
          xray={view.raioX}
          showEdges={view.arestas}
          explode={explode}
          moduleCenters={moduleCenters}
        />

        {/* Ferragens e usinagens por módulo (dobradiças sempre; furos só no raio-X) */}
        {placed.map((pm) => (
          <group key={`hw_${pm.module.id}`}>
            <Hinges result={pm.result} />
            {view.raioX && <Usinagens result={pm.result} offsetX={pm.offsetX} posZ={pm.module.posZ ?? 0} />}
          </group>
        ))}

        {/* Decoração procedural */}
        {decoracoes.map((dc) => {
          const size = DECOR_SIZE[dc.tipo]
          const isSel = selectedId === `decor::${dc.id}`
          return (
            <group
              key={dc.id}
              position={[dc.x * MM, 0, dc.z * MM]}
              rotation={[0, (-dc.rot * Math.PI) / 180, 0]}
              onClick={(e) => {
                e.stopPropagation()
                handleSelect(`decor::${dc.id}`, dc.tipo)
              }}
            >
              <DecorObject tipo={dc.tipo} />
              {!readOnly && (
                <mesh visible={false} position={[0, size.h * MM / 2, 0]}>
                  <boxGeometry args={[size.w * MM, size.h * MM, size.d * MM]} />
                </mesh>
              )}
              {isSel && (
                <lineSegments position={[0, (size.h * MM) / 2, 0]}>
                  <edgesGeometry args={[new THREE.BoxGeometry(size.w * MM, size.h * MM, size.d * MM)]} attach="geometry" />
                  <lineBasicMaterial color="#22c55e" transparent opacity={0.95} />
                </lineSegments>
              )}
            </group>
          )
        })}

        {/* Gizmo do módulo selecionado (arraste livre híbrido) */}
        {!readOnly && selectedPlaced && handlers && (
          <DragGizmo
            center={[
              selectedPlaced.offsetX + selectedPlaced.width / 2,
              (heights[selectedPlaced.module.id] ?? selectedPlaced.result.dimensions.height) / 2000,
              (selectedPlaced.module.posZ ?? 0) + selectedPlaced.depth / 2,
            ]}
            onCommit={(dx, dz) => {
              const cur = selectedPlaced.module
              handlers.onModuleFreeMove(cur.id, Math.max(0, (cur.posX ?? selectedPlaced.offsetX) + dx), Math.max(0, (cur.posZ ?? 0) + dz))
            }}
          />
        )}

        {/* Gizmo da decoração selecionada */}
        {!readOnly && selectedDecor && handlers && (
          <DragGizmo
            center={[selectedDecor.x * MM, 0.05, selectedDecor.z * MM]}
            onCommit={(dx, dz) => {
              handlers.onDecorMove(selectedDecor.id, Math.max(0, selectedDecor.x + dx), Math.max(0, selectedDecor.z + dz))
            }}
          />
        )}

        {/* Highlight do módulo selecionado */}
        {selectedPlaced && (
          <Outline
            x0={selectedPlaced.offsetX}
            x1={selectedPlaced.offsetX + selectedPlaced.width}
            height={heights[selectedPlaced.module.id] ?? selectedPlaced.result.dimensions.height}
            depth={selectedPlaced.depth + (selectedPlaced.module.posZ ?? 0)}
            color="#8b5cf6"
          />
        )}

        {/* Destaque vermelho dos módulos em colisão */}
        {[...collisionIds].map((id) => {
          const pm = placed.find((p) => p.module.id === id)
          if (!pm || id === selectedId) return null
          return (
            <Outline
              key={`col_${id}`}
              x0={pm.offsetX}
              x1={pm.offsetX + pm.width}
              height={heights[id] ?? pm.result.dimensions.height}
              depth={pm.depth + (pm.module.posZ ?? 0)}
              color="#ef4444"
            />
          )
        })}

        {/* Cotas por módulo + total (frente do ambiente) */}
        {view.cotas &&
          placed.map((pm) => (
            <Html
              key={`cota_${pm.module.id}`}
              position={[(pm.offsetX + pm.width / 2) * MM, 0.02, ((pm.depth + (pm.module.posZ ?? 0)) + 120) * MM]}
              center
              zIndexRange={[5, 0]}
            >
              <div className="px-1.5 py-0.5 rounded-md bg-steel-900/85 text-white text-[9px] font-bold font-mono whitespace-nowrap border border-steel-700/60 pointer-events-none">
                {(pm.width / 10).toFixed(0)}
              </div>
            </Html>
          ))}
        {view.cotas && totalWidth > 0 && (
          <>
            <Line
              points={[
                [0, 0.004, (depth + 260) * MM],
                [w, 0.004, (depth + 260) * MM],
              ]}
              color="#8b5cf6"
              lineWidth={1.5}
            />
            <Html position={[cx, 0.02, (depth + 320) * MM]} center zIndexRange={[5, 0]}>
              <div className="px-2 py-0.5 rounded-md bg-violet-600 text-white text-[10px] font-bold font-mono whitespace-nowrap pointer-events-none shadow-lg">
                Total {(totalWidth / 10).toFixed(0)} cm
              </div>
            </Html>
          </>
        )}

        <Grid
          position={[cx, 0.001, cz]}
          args={[w + 2, d + 2]}
          cellSize={0.25}
          cellThickness={0.6}
          cellColor="#3a3f52"
          sectionSize={1}
          sectionThickness={1}
          sectionColor="#565d75"
          fadeDistance={40}
          infiniteGrid={false}
        />
        <ContactShadows position={[cx, 0.003, cz]} opacity={0.35} scale={Math.max(w, d) + 2} blur={2.4} far={4} />
        <CameraControls ref={controlsRef} makeDefault smoothTime={0.35} />
        <Fx />
      </Canvas>

      {/* Botões flutuantes: modos de visão + captura PNG */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-10">
        {!readOnly && (
          <>
            <button
              type="button"
              onClick={() => useEnvStore.getState().toggleView('frentes')}
              className={`w-9.5 h-9.5 grid place-items-center rounded-xl border shadow-lg active:scale-95 transition-all ${view.frentes ? 'bg-steel-900/80 hover:bg-steel-800 text-steel-200 border-steel-700/50' : 'bg-violet-600 text-white border-violet-500'}`}
              title={view.frentes ? 'Ocultar frentes' : 'Mostrar frentes'}
            >
              {view.frentes ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
            <button
              type="button"
              onClick={() => useEnvStore.getState().toggleView('raioX')}
              className={`w-9.5 h-9.5 grid place-items-center rounded-xl border shadow-lg active:scale-95 transition-all ${view.raioX ? 'bg-violet-600 text-white border-violet-500' : 'bg-steel-900/80 hover:bg-steel-800 text-steel-200 border-steel-700/50'}`}
              title="Visão raio-X"
            >
              <Scan size={15} />
            </button>
            <button
              type="button"
              onClick={() => useEnvStore.getState().toggleView('arestas')}
              className={`w-9.5 h-9.5 grid place-items-center rounded-xl border shadow-lg active:scale-95 transition-all ${view.arestas ? 'bg-violet-600 text-white border-violet-500' : 'bg-steel-900/80 hover:bg-steel-800 text-steel-200 border-steel-700/50'}`}
              title="Arestas"
            >
              <Box size={15} />
            </button>
            <button
              type="button"
              onClick={() => useEnvStore.getState().toggleView('cotas')}
              className={`w-9.5 h-9.5 grid place-items-center rounded-xl border shadow-lg active:scale-95 transition-all ${view.cotas ? 'bg-violet-600 text-white border-violet-500' : 'bg-steel-900/80 hover:bg-steel-800 text-steel-200 border-steel-700/50'}`}
              title="Cotas"
            >
              <Ruler size={15} />
            </button>
            <button
              type="button"
              onClick={() => useEnvStore.getState().toggleView('sala')}
              className={`w-9.5 h-9.5 grid place-items-center rounded-xl border shadow-lg active:scale-95 transition-all ${view.sala ? 'bg-violet-600 text-white border-violet-500' : 'bg-steel-900/80 hover:bg-steel-800 text-steel-200 border-steel-700/50'}`}
              title="Sala (parede + piso)"
            >
              <House size={15} />
            </button>
          </>
        )}
        <button
          type="button"
          onClick={handleScreenshot}
          className="w-9.5 h-9.5 grid place-items-center rounded-xl bg-steel-900/80 hover:bg-steel-800 text-steel-200 border border-steel-700/50 shadow-lg active:scale-95 transition-all"
          title="Salvar imagem PNG"
        >
          <Camera size={15} />
        </button>
      </div>
    </div>
  )
}
