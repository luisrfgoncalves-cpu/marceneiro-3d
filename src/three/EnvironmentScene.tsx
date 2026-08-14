// Cena do ambiente completo (Seção 11.7): módulos posicionados lado a lado,
// reutilizando a mesma renderização InstancedMesh da tela de ajuste.

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, ContactShadows } from '@react-three/drei'
import type { PlacedPiece } from '../engine/environment'
import { Pieces } from './Pieces'

interface EnvironmentSceneProps {
  pieces: PlacedPiece[]
  totalWidth: number
  depth: number
}

export function EnvironmentScene({ pieces, totalWidth, depth }: EnvironmentSceneProps) {
  const w = Math.max(totalWidth * 0.001, 1)
  const d = Math.max(depth * 0.001, 0.6)
  const cx = w / 2
  const cz = d / 2
  const cameraDist = Math.max(w, d) * 0.9 + 2

  return (
    <Canvas
      camera={{ position: [cx + cameraDist * 0.6, cameraDist * 0.8, cz + cameraDist], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[6, 10, 7]} intensity={1.1} />
      <directionalLight position={[-6, 4, -4]} intensity={0.35} color="#dbe4ff" />
      <Pieces pieces={pieces} />
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
      <ContactShadows position={[cx, 0.002, cz]} opacity={0.35} scale={Math.max(w, d) + 2} blur={2.4} far={4} />
      <OrbitControls makeDefault enablePan={false} minDistance={0.8} maxDistance={w + 10} maxPolarAngle={Math.PI / 2.02} />
    </Canvas>
  )
}
