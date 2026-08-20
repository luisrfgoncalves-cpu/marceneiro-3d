// Preview 3D ao vivo (Seção 11.5): qualquer ajuste na configuração recalcula
// o motor e re-renderiza sem botão "aplicar" e sem loading.
// Atualizado com luzes mais vívidas, melhor posicionamento para mobile, e botão de reset visualização.

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei'
import type { ModuleResult } from '../engine/types'
import { Pieces } from './Pieces'
import { Pistons } from './Pistons'
import { RotateCcw } from 'lucide-react'
import { useRef } from 'react'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'

interface SceneProps {
  result: ModuleResult
}

export function Scene({ result }: SceneProps) {
  const { width, depth } = result.dimensions
  const w = Math.max(width * 0.001, 0.5)
  const d = Math.max(depth * 0.001, 0.5)
  const controlsRef = useRef<OrbitControlsImpl>(null)

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [2.5, 2.0, 3.2], fov: 40 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        {/* Iluminação Premium e Vívida */}
        <ambientLight intensity={0.9} />
        {/* Sol forte */}
        <directionalLight position={[8, 12, 6]} intensity={1.5} castShadow />
        {/* Luz de preenchimento suave azulada (céu) */}
        <directionalLight position={[-8, 6, -6]} intensity={0.5} color="#e0f2fe" />
        {/* Luz de baixo quente (rebote do chão) */}
        <directionalLight position={[0, -5, 0]} intensity={0.3} color="#fef08a" />

        <Pieces pieces={result.pieces} />
        <Pistons result={result} />
        
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
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={true}
          minDistance={0.5}
          maxDistance={8}
          maxPolarAngle={Math.PI / 2.02}
        />
      </Canvas>

      {/* Botão flutuante para resetar a visualização da câmera */}
      <button
        type="button"
        onClick={resetView}
        className="absolute right-4 bottom-4 w-9.5 h-9.5 grid place-items-center rounded-xl bg-steel-900/80 hover:bg-steel-800 text-steel-200 border border-steel-700/50 shadow-lg active:scale-95 transition-all z-10"
        title="Resetar Câmera"
      >
        <RotateCcw size={15} />
      </button>
    </div>
  )
}
