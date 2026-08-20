// Script temporario de geracao de icones PWA (Anexo A3)
// Roda uma vez: node generate-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = resolve(__dirname, 'public/icon.svg')
const svgBuffer = readFileSync(svgPath)

const sizes = [
  { size: 192, file: 'pwa-192x192.png' },
  { size: 512, file: 'pwa-512x512.png' },
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 32, file: 'favicon-32x32.png' },
]

for (const { size, file } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(__dirname, `public/${file}`))
  console.log(`Generated public/${file} (${size}x${size})`)
}

const padding = 52
const innerSize = 512 - padding * 2
await sharp(svgBuffer)
  .resize(innerSize, innerSize)
  .extend({
    top: padding,
    bottom: padding,
    left: padding,
    right: padding,
    background: { r: 26, g: 29, b: 41, alpha: 1 },
  })
  .png()
  .toFile(resolve(__dirname, 'public/pwa-maskable-512x512.png'))
console.log('Generated public/pwa-maskable-512x512.png (maskable)')
