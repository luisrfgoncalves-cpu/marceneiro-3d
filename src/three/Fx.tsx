// Pós-processamento leve (bloom suave + vinheta) apenas em dispositivos capazes.
// Em celulares modestos o canvas roda sem efeitos para manter 60fps.

import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

export const HIGH_PERF =
  typeof navigator !== 'undefined' &&
  (navigator.hardwareConcurrency ?? 4) >= 6 &&
  !(typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches)

export function Fx() {
  if (!HIGH_PERF) return null
  return (
    <EffectComposer multisampling={4}>
      <Bloom intensity={0.22} luminanceThreshold={0.82} mipmapBlur />
      <Vignette offset={0.25} darkness={0.32} />
    </EffectComposer>
  )
}
