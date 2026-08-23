// Captura PNG do canvas 3D para compartilhar o projeto com o cliente.
import * as THREE from 'three'

export function captureScreenshot(gl: THREE.WebGLRenderer | null, filename: string) {
  if (!gl) return
  const canvas = gl.domElement
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename.endsWith('.png') ? filename : `${filename}.png`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1500)
  }, 'image/png')
}
