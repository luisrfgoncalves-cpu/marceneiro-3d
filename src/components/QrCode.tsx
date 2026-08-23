// QR code para compartilhar link de visualização (manual de montagem).

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

export function QrCode({ text, size = 170 }: { text: string; size?: number }) {
  const [url, setUrl] = useState('')

  useEffect(() => {
    let alive = true
    QRCode.toDataURL(text, {
      width: size * 2,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((u) => alive && setUrl(u))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [text, size])

  if (!url) return <div style={{ width: size, height: size }} className="rounded-xl bg-bg-panel-hover animate-pulse shrink-0" />
  return (
    <img src={url} width={size} height={size} alt="QR code" className="rounded-xl shadow-sm border border-border-subtle shrink-0" />
  )
}
