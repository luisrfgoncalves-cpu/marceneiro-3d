import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Registra o renderer WebGL fora do Canvas para permitir captura de tela (PNG).
export function GlCapture({ onReady }: { onReady: (gl: THREE.WebGLRenderer) => void }) {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    onReady(gl)
  }, [gl, onReady])
  return null
}
