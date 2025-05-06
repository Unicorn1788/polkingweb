"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Check, Upload, RefreshCw } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"

export interface QRCodeCustomizationOptions {
  fgColor: string
  bgColor: string
  logoImage: string | null
  logoWidth: number
  logoHeight: number
  size: number
  includeMargin: boolean
  logoOpacity: number
  cornerType: "square" | "rounded" | "dots"
  dotType: "square" | "rounded" | "dots" | "classy"
}

interface QRCodeCustomizerProps {
  value: string
  initialOptions?: Partial<QRCodeCustomizationOptions>
  onChange?: (options: QRCodeCustomizationOptions) => void
  onSave?: (dataUrl: string) => void
  className?: string
}

const DEFAULT_OPTIONS: QRCodeCustomizationOptions = {
  fgColor: "#000000",
  bgColor: "#FFFFFF",
  logoImage: null,
  logoWidth: 50,
  logoHeight: 50,
  size: 250,
  includeMargin: true,
  logoOpacity: 1,
  cornerType: "square",
  dotType: "square",
}

export default function QRCodeCustomizer({
  value,
  initialOptions,
  onChange,
  onSave,
  className,
}: QRCodeCustomizerProps) {
  const [options, setOptions] = useState<QRCodeCustomizationOptions>(() => ({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  }))
  const [logoUrl, setLogoUrl] = useState<string | null>(initialOptions?.logoImage || null)
  const [previewKey, setPreviewKey] = useState(0)
  const qrCodeRef = useRef<SVGSVGElement>(null)
  const prevOptionsRef = useRef<QRCodeCustomizationOptions | null>(null)
  const isInitialRender = useRef(true)

  // Call onChange only when options change, not on every render
  useEffect(() => {
    // Skip the first render
    if (isInitialRender.current) {
      isInitialRender.current = false
      prevOptionsRef.current = options
      return
    }

    // Skip if options haven't changed
    if (JSON.stringify(prevOptionsRef.current) === JSON.stringify(options)) {
      return
    }

    // Call onChange with the new options
    if (onChange) {
      onChange(options)
    }

    // Update the previous options
    prevOptionsRef.current = options
  }, [options, onChange])

  const handleOptionChange = useCallback(
    <K extends keyof QRCodeCustomizationOptions>(key: K, value: QRCodeCustomizationOptions[K]) => {
      setOptions((prevOptions) => ({
        ...prevOptions,
        [key]: value,
      }))
    },
    [],
  )

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setLogoUrl(result)
        handleOptionChange("logoImage", result)
      }
      reader.readAsDataURL(file)
    },
    [handleOptionChange],
  )

  const handleSave = useCallback(() => {
    if (!qrCodeRef.current || !onSave) return

    // Create a canvas element
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = options.size + (options.includeMargin ? 40 : 0)
    canvas.height = options.size + (options.includeMargin ? 40 : 0)

    // Draw background
    ctx.fillStyle = options.bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(qrCodeRef.current)
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      onSave(canvas.toDataURL("image/png"))
    }
    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }, [options.size, options.includeMargin, options.bgColor, onSave])

  const refreshPreview = useCallback(() => {
    setPreviewKey((prev) => prev + 1)
  }, [])

  // QR code styling based on options
  const getQRCodeOptions = useCallback(() => {
    const qrOptions: any = {
      value,
      size: options.size,
      bgColor: options.bgColor,
      fgColor: options.fgColor,
      level: "H", // High error correction for logo
      includeMargin: options.includeMargin,
    }

    // Add logo if provided
    if (logoUrl) {
      qrOptions.imageSettings = {
        src: logoUrl,
        height: options.logoHeight,
        width: options.logoWidth,
        excavate: true,
      }
    }

    return qrOptions
  }, [value, options, logoUrl])

  return (
    <div className={cn("qr-code-customizer space-y-6", className)}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* QR Code Preview */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-900/10 to-blue-900/10 rounded-lg border border-purple-500/20">
          <div className="mb-4 relative">
            <div
              key={previewKey}
              className={cn(
                "p-4 bg-white rounded-lg shadow-md",
                options.cornerType === "rounded" && "rounded-xl overflow-hidden",
                options.cornerType === "dots" && "rounded-full overflow-hidden",
              )}
            >
              <QRCodeSVG {...getQRCodeOptions()} ref={qrCodeRef} />
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/80 hover:bg-white"
              onClick={refreshPreview}
              title="Refresh preview"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Check className="h-4 w-4" />
            Save QR Code
          </Button>
        </div>

        {/* Customization Options */}
        <div className="flex-1">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="logo">Logo</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fgColor">Foreground Color</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: options.fgColor }}></div>
                  <Input
                    id="fgColor"
                    type="color"
                    value={options.fgColor}
                    onChange={(e) => handleOptionChange("fgColor", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bgColor">Background Color</Label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded border" style={{ backgroundColor: options.bgColor }}></div>
                  <Input
                    id="bgColor"
                    type="color"
                    value={options.bgColor}
                    onChange={(e) => handleOptionChange("bgColor", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="includeMargin">Include Margin</Label>
                  <Switch
                    id="includeMargin"
                    checked={options.includeMargin}
                    onCheckedChange={(checked) => handleOptionChange("includeMargin", checked)}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Logo Tab */}
            <TabsContent value="logo" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUpload">Upload Logo</Label>
                <div className="flex gap-2">
                  <div className="w-16 h-16 border rounded flex items-center justify-center overflow-hidden bg-white">
                    {logoUrl ? (
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                        style={{ opacity: options.logoOpacity }}
                      />
                    ) : (
                      <Upload className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input
                      id="logoUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full"
                    />
                    {logoUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => {
                          setLogoUrl(null)
                          handleOptionChange("logoImage", null)
                        }}
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {logoUrl && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="logoSize">Logo Size: {options.logoWidth}px</Label>
                    <Slider
                      id="logoSize"
                      min={20}
                      max={100}
                      step={5}
                      value={[options.logoWidth]}
                      onValueChange={(value) => {
                        handleOptionChange("logoWidth", value[0])
                        handleOptionChange("logoHeight", value[0])
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="logoOpacity">Logo Opacity: {Math.round(options.logoOpacity * 100)}%</Label>
                    <Slider
                      id="logoOpacity"
                      min={0.1}
                      max={1}
                      step={0.1}
                      value={[options.logoOpacity]}
                      onValueChange={(value) => handleOptionChange("logoOpacity", value[0])}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="size">QR Code Size: {options.size}px</Label>
                <Slider
                  id="size"
                  min={100}
                  max={400}
                  step={10}
                  value={[options.size]}
                  onValueChange={(value) => handleOptionChange("size", value[0])}
                />
              </div>

              <div className="space-y-2">
                <Label>Corner Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["square", "rounded", "dots"].map((type) => (
                    <Button
                      key={type}
                      variant={options.cornerType === type ? "default" : "outline"}
                      className="h-auto py-2"
                      onClick={() => handleOptionChange("cornerType", type as any)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
