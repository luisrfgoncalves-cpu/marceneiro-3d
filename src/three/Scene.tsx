// Preview 3D ao vivo (Seção 11.5): qualquer ajuste na configuração recalcula
// o motor e re-renderiza sem botão "aplicar" e sem loading.

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei'
import type { ModuleResult } from '../engine/types'
import { Pieces } from './Pieces'
import { Pistons } from './Pistons'

interface SceneProps {
  result: ModuleResult
}

export function Scene({ result }: SceneProps) {
  const { width, depth } = result.dimensions
  const w = Math.max(width * 0.001, 0.5)
  const d = Math.max(depth * 0.001, 0.5)

  return (
    <Canvas
      camera={{ position: [3.2, 2.6, 4.2], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 10, 7]} intensity={1.1} />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} color="#dbe4ff" />
      <Pieces pieces={result.pieces} />
      <Pistons result={result} />
      <Grid
        position={[w / 2, 0.001, d / 2]}
        args={[w + 2, d + 2]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#3a3f52"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#565d75"
        fadeDistance={30}
        infiniteGrid={false}
      />
      <ContactShadows position={[w / 2, 0.002, d / 2]} opacity={0.35} scale={Math.max(w, d) + 2} blur={2.4} far={3} />
      <OrbitControls makeDefault enablePan={false} minDistance={0.6} maxDistance={9} maxPolarAngle={Math.PI / 2.02} />
    </Canvas>
  )
}