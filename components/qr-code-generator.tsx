"use client"

import { useState, useEffect, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"

interface QRCodeGeneratorProps {
  url: string
  size?: number
  logoUrl?: string
  title?: string
  description?: string
  className?: string
}

export default function QRCodeGenerator({
  url,
  size = 250,
  logoUrl,
  title,
  description,
  className = "",
}: QRCodeGeneratorProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  // Generate QR code data URL for download
  useEffect(() => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector("canvas")
      if (canvas) {
        setQrCodeDataUrl(canvas.toDataURL("image/png"))
      }
    }
  }, [url, size, logoUrl])

  // Handle download QR code
  const handleDownload = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement("a")
      link.href = qrCodeDataUrl
      link.download = `${title ? title.replace(/\s+/g, "-").toLowerCase() : "qr-code"}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div ref={qrRef} className="bg-white p-4 rounded-lg mb-4">
        <QRCodeSVG
          value={url}
          size={size}
          level="H" // High error correction
          includeMargin={true}
          imageSettings={
            logoUrl
              ? {
                  src: logoUrl,
                  x: undefined,
                  y: undefined,
                  height: size * 0.2,
                  width: size * 0.2,
                  excavate: true,
                }
              : undefined
          }
        />
      </div>

      {(title || description) && (
        <div className="text-center mb-4">
          {title && <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>}
          {description && <p className="text-sm text-white/70">{description}</p>}
        </div>
      )}

      <div className="w-full bg-[#0f0c1a]/70 rounded-lg p-3 border border-[#a58af8]/20 mb-4">
        <p className="text-xs text-white/50 mb-1">URL</p>
        <p className="text-sm text-white break-all">{url}</p>
      </div>

      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-[#a58af8] hover:bg-[#8a6ad8] text-white rounded-lg transition-colors"
      >
        Download QR Code
      </button>
    </div>
  )
}
