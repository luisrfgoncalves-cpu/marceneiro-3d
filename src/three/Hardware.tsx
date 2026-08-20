import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { CorredicaTipo, DobradicaTipo } from '../engine/types'

const MM = 0.001

const HARDWARE_MAT = new THREE.MeshStandardMaterial({
  color: '#c2c5cc',
  metalness: 0.9,
  roughness: 0.3,
})

export function Slide({ length, yPos, xPos, zPos, type, openRatio }: { length: number, yPos: number, xPos: number, zPos: number, type: CorredicaTipo, openRatio: number }) {
  const width = type === 'invisivel' ? 30 : 12
  const height = type === 'invisivel' ? 30 : 45
  
  const stage1 = useRef<THREE.Group>(null)
  const stage2 = useRef<THREE.Group>(null)
  const stage3 = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!stage2.current || !stage3.current) return
    const extension = length * openRatio
    stage2.current.position.z = extension * 0.5 * MM
    stage3.current.position.z = extension * 1.0 * MM
  })

  return (
    <group position={[xPos * MM, yPos * MM, zPos * MM]}>
       <group ref={stage1}>
         <mesh material={HARDWARE_MAT}>
           <boxGeometry args={[width * 0.3 * MM, height * MM, length * MM]} />
         </mesh>
       </group>
       <group ref={stage2}>
         <mesh material={HARDWARE_MAT} position={[(width * 0.3) * MM, 0, 0]}>
           <boxGeometry args={[width * 0.3 * MM, height * 0.8 * MM, length * MM]} />
         </mesh>
       </group>
       <group ref={stage3}>
         <mesh material={HARDWARE_MAT} position={[(width * 0.6) * MM, 0, 0]}>
           <boxGeometry args={[width * 0.4 * MM, height * 0.6 * MM, length * MM]} />
         </mesh>
       </group>
    </group>
  )
}

export function Hinge({ yPos, xPos, zPos, angle }: { yPos: number, xPos: number, zPos: number, angle: number, type: DobradicaTipo }) {
  return (
    <group position={[xPos * MM, yPos * MM, zPos * MM]}>
      <mesh material={HARDWARE_MAT} position={[0, 0, 15 * MM]}>
         <boxGeometry args={[5 * MM, 30 * MM, 30 * MM]} />
      </mesh>
      <group rotation={[0, angle, 0]}>
        <mesh material={HARDWARE_MAT} position={[-15 * MM, 0, 20 * MM]}>
           <boxGeometry args={[30 * MM, 15 * MM, 5 * MM]} />
        </mesh>
        <mesh material={HARDWARE_MAT} position={[-25 * MM, 0, 20 * MM]} rotation={[0, 0, Math.PI / 2]}>
           <cylinderGeometry args={[17.5 * MM, 17.5 * MM, 5 * MM, 16]} />
        </mesh>
      </group>
    </group>
  )
}
