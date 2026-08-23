// Preview 3D ao vivo (Seção 11.5): qualquer ajuste na configuração recalcula
// o motor e re-renderiza sem botão "aplicar" e sem loading.
// Atualizado com luzes mais vívidas, melhor posicionamento para mobile, e botão de reset visualização.

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, ContactShadows, Environment } from '@react-three/drei'
import type { ModuleResult } from '../engine/types'
import { Pieces } from './Pieces'
import { Pistons } from './Pistons'
import { Hinges } from './Hinges'
import { GlCapture } from './GlCapture'
import { Fx } from './Fx'
import { captureScreenshot } from '../lib/screenshot'
import { RotateCcw, Camera, Bomb } from 'lucide-react'
import { useCallback, useMemo, useRef, useState } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

interface SceneProps {
  result: ModuleResult
  screenshotName?: string
}

export function Scene({ result, screenshotName = 'modulo' }: SceneProps) {
  const { width, depth } = result.dimensions
  const w = Math.max(width * 0.001, 0.5)
  const d = Math.max(depth * 0.001, 0.5)
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const glRef = useRef<import('three').WebGLRenderer | null>(null)
  const [, force] = useState(0)
  const [explode, setExplode] = useState(0)
  const onGlReady = useCallback((gl: import('three').WebGLRenderer) => {
    glRef.current = gl
    force((n) => n + 1)
  }, [])

  const moduleCenters = useMemo(
    () => new Map([['__single__', { x: width / 2, z: depth / 2, h: result.dimensions.height }]]),
    [width, depth, result.dimensions.height],
  )

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  const handleScreenshot = () => {
    captureScreenshot(glRef.current, `${screenshotName}-3d`)
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [2.5, 2.0, 3.2], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <GlCapture onReady={onGlReady} />
        {/* Iluminação Premium e Vívida */}
        <ambientLight intensity={0.9} />
        {/* Sol forte */}
        <directionalLight position={[8, 12, 6]} intensity={1.5} castShadow />
        {/* Luz de preenchimento suave azulada (céu) */}
        <directionalLight position={[-8, 6, -6]} intensity={0.5} color="#e0f2fe" />
        {/* Luz de baixo quente (rebote do chão) */}
        <directionalLight position={[0, -5, 0]} intensity={0.3} color="#fef08a" />

        <Pieces
          pieces={result.pieces.map((p) => ({ ...p, moduleId: '__single__' }))}
          explode={explode}
          moduleCenters={moduleCenters}
        />
        <Pistons result={result} />
        <Hinges result={result} />
        
        <Grid
          position={[w / 2, 0.001, d / 2]}
          args={[w + 2, d + 2]}
          cellSize={0.2}
          cellThickness={0.5}
          cellColor="#475569"
          sectionSize={1}
          sectionThickness={0.9}
          sectionColor="#64748b"
          fadeDistance={25}
          infiniteGrid={false}
        />
        <ContactShadows position={[w / 2, 0.002, d / 2]} opacity={0.4} scale={Math.max(w, d) + 2} blur={2.0} far={3} />
        <Environment preset="apartment" />
        <Fx />
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={true}
          minDistance={0.5}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2.02}
        />
      </Canvas>

      {/* Slider vista explodida */}
      <div className="absolute left-4 bottom-4 z-10 flex items-center gap-2 rounded-xl bg-steel-900/80 border border-steel-700/50 shadow-lg px-3 py-2 backdrop-blur-sm">
        <Bomb size={14} className="text-steel-300 shrink-0" />
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(explode * 100)}
          onChange={(e) => setExplode(Number(e.target.value) / 100)}
          className="w-24 md:w-36 accent-violet-500"
          aria-label="Vista explodida"
          title="Vista explodida"
        />
        <span className="text-[10px] font-mono text-steel-300 w-7 text-right tabular-nums">{Math.round(explode * 100)}%</span>
      </div>

      {/* Botões flutuantes: resetar câmera + capturar PNG */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-2 z-10">
        <button
          type="button"
          onClick={handleScreenshot}
          className="w-9.5 h-9.5 grid place-items-center rounded-xl bg-steel-900/80 hover:bg-steel-800 text-steel-200 border border-steel-700/50 shadow-lg active:scale-95 transition-all"
          title="Salvar imagem PNG"
        >
          <Camera size={15} />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="w-9.5 h-9.5 grid place-items-center rounded-xl bg-steel-900/80 hover:bg-steel-800 text-steel-200 border border-steel-700/50 shadow-lg active:scale-95 transition-all"
          title="Resetar Câmera"
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </div>
  )
}
