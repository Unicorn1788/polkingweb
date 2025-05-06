"use client"

import { v4 as uuidv4 } from "uuid"

// Define the QR code scan data structure
export interface QRCodeScan {
  id: string
  qrId: string
  timestamp: string
  device: string
  browser: string
  os: string
  referrer: string | null
  countdownId: string
}

// Define the QR code data structure
export interface QRCodeData {
  id: string
  url: string
  countdownId: string
  eventName: string
  targetDate: string
  createdAt: string
  customized: boolean
  scans: number
  lastScan: string | null
}

// Local storage keys
const QR_CODES_STORAGE_KEY = "polking:qr-codes"
const QR_SCANS_STORAGE_KEY = "polking:qr-scans"

/**
 * Generate a trackable QR code URL with a unique identifier
 */
export function generateTrackableQRCodeUrl(
  baseUrl: string,
  eventName?: string,
  targetDate?: string,
  isCustomized = false,
): { url: string; qrId: string } {
  const qrId = uuidv4()
  // Add null checks and default values
  const safeEventName = eventName || "unnamed-event"
  const safeTargetDate = targetDate || new Date().toISOString()

  const countdownId = `${safeEventName.toLowerCase().replace(/\s+/g, "-")}-${new Date(safeTargetDate).getTime()}`

  // Create URL with tracking parameters
  const url = new URL(baseUrl || window.location.href)
  url.searchParams.set("qr", qrId)

  // Store QR code data
  storeQRCodeData({
    id: qrId,
    url: url.toString(),
    countdownId,
    eventName: safeEventName,
    targetDate: safeTargetDate,
    createdAt: new Date().toISOString(),
    customized: isCustomized,
    scans: 0,
    lastScan: null,
  })

  return { url: url.toString(), qrId }
}

/**
 * Store QR code data in local storage
 */
function storeQRCodeData(qrCodeData: QRCodeData): void {
  if (typeof window === "undefined") return

  try {
    // Get existing QR codes
    const existingQRCodes = getAllQRCodes()

    // Add new QR code data
    const updatedQRCodes = [...existingQRCodes.filter((qr) => qr.id !== qrCodeData.id), qrCodeData]

    // Save to local storage
    localStorage.setItem(QR_CODES_STORAGE_KEY, JSON.stringify(updatedQRCodes))
  } catch (error) {
    console.error("Error storing QR code data:", error)
  }
}

/**
 * Get all QR codes
 */
export function getAllQRCodes(): QRCodeData[] {
  if (typeof window === "undefined") return []

  try {
    const storedQRCodes = localStorage.getItem(QR_CODES_STORAGE_KEY)
    return storedQRCodes ? JSON.parse(storedQRCodes) : []
  } catch (error) {
    console.error("Error getting QR codes:", error)
    return []
  }
}

/**
 * Get QR code data by ID
 */
export function getQRCodeById(qrId: string): QRCodeData | undefined {
  const allQRCodes = getAllQRCodes()
  return allQRCodes.find((qr) => qr.id === qrId)
}

/**
 * Get QR codes for a specific countdown
 */
export function getQRCodesByCountdownId(countdownId: string): QRCodeData[] {
  const allQRCodes = getAllQRCodes()
  return allQRCodes.filter((qr) => qr.countdownId === countdownId)
}

/**
 * Record a QR code scan
 */
export function recordQRCodeScan(qrId: string, countdownId: string): void {
  if (typeof window === "undefined" || !qrId) return

  try {
    // Get browser and device info
    const userAgent = navigator.userAgent
    const browser = detectBrowser(userAgent)
    const os = detectOS(userAgent)
    const device = detectDevice(userAgent)
    const referrer = document.referrer || null

    // Create scan record
    const scanData: QRCodeScan = {
      id: uuidv4(),
      qrId,
      timestamp: new Date().toISOString(),
      device,
      browser,
      os,
      referrer,
      countdownId,
    }

    // Store scan data
    const existingScans = getAllQRScans()
    localStorage.setItem(QR_SCANS_STORAGE_KEY, JSON.stringify([...existingScans, scanData]))

    // Update QR code scan count
    const qrCode = getQRCodeById(qrId)
    if (qrCode) {
      storeQRCodeData({
        ...qrCode,
        scans: qrCode.scans + 1,
        lastScan: scanData.timestamp,
      })
    }

    console.log(`Recorded QR code scan: ${qrId}`)
  } catch (error) {
    console.error("Error recording QR code scan:", error)
  }
}

/**
 * Get all QR code scans
 */
export function getAllQRScans(): QRCodeScan[] {
  if (typeof window === "undefined") return []

  try {
    const storedScans = localStorage.getItem(QR_SCANS_STORAGE_KEY)
    return storedScans ? JSON.parse(storedScans) : []
  } catch (error) {
    console.error("Error getting QR scans:", error)
    return []
  }
}

/**
 * Get QR code scans by QR ID
 */
export function getQRScansByQRId(qrId: string): QRCodeScan[] {
  const allScans = getAllQRScans()
  return allScans.filter((scan) => scan.qrId === qrId)
}

/**
 * Get QR code scans by countdown ID
 */
export function getQRScansByCountdownId(countdownId: string): QRCodeScan[] {
  const allScans = getAllQRScans()
  return allScans.filter((scan) => scan.countdownId === countdownId)
}

/**
 * Clear all QR code data
 */
export function clearQRCodeData(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(QR_CODES_STORAGE_KEY)
    localStorage.removeItem(QR_SCANS_STORAGE_KEY)
  } catch (error) {
    console.error("Error clearing QR code data:", error)
  }
}

/**
 * Get QR code statistics
 */
export function getQRCodeStatistics() {
  const allQRCodes = getAllQRCodes()
  const allScans = getAllQRScans()

  // Total stats
  const totalQRCodes = allQRCodes.length
  const totalScans = allScans.length
  const customizedQRCodes = allQRCodes.filter((qr) => qr.customized).length

  // Get unique countdown events
  const uniqueCountdowns = [...new Set(allQRCodes.map((qr) => qr.countdownId))]

  // Get scans by device type
  const scansByDevice = allScans.reduce(
    (acc, scan) => {
      acc[scan.device] = (acc[scan.device] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get scans by browser
  const scansByBrowser = allScans.reduce(
    (acc, scan) => {
      acc[scan.browser] = (acc[scan.browser] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get scans by OS
  const scansByOS = allScans.reduce(
    (acc, scan) => {
      acc[scan.os] = (acc[scan.os] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Get scans by day
  const scansByDay = allScans.reduce(
    (acc, scan) => {
      const date = new Date(scan.timestamp).toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalQRCodes,
    totalScans,
    customizedQRCodes,
    uniqueCountdowns: uniqueCountdowns.length,
    scansByDevice,
    scansByBrowser,
    scansByOS,
    scansByDay,
    mostScannedQR: allQRCodes.sort((a, b) => b.scans - a.scans)[0] || null,
    recentScans: allScans
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10),
  }
}

// Helper functions to detect browser, OS, and device
function detectBrowser(userAgent: string): string {
  if (userAgent.includes("Firefox")) return "Firefox"
  if (userAgent.includes("SamsungBrowser")) return "Samsung Browser"
  if (userAgent.includes("Opera") || userAgent.includes("OPR")) return "Opera"
  if (userAgent.includes("Trident")) return "Internet Explorer"
  if (userAgent.includes("Edge")) return "Edge"
  if (userAgent.includes("Chrome")) return "Chrome"
  if (userAgent.includes("Safari")) return "Safari"
  return "Unknown"
}

function detectOS(userAgent: string): string {
  if (userAgent.includes("Windows NT")) return "Windows"
  if (userAgent.includes("Android")) return "Android"
  if (userAgent.includes("iPhone") || userAgent.includes("iPad") || userAgent.includes("iPod")) return "iOS"
  if (userAgent.includes("Mac OS")) return "macOS"
  if (userAgent.includes("Linux")) return "Linux"
  return "Unknown"
}

function detectDevice(userAgent: string): string {
  if (userAgent.includes("iPhone")) return "iPhone"
  if (userAgent.includes("iPad")) return "iPad"
  if (userAgent.includes("Android") && userAgent.includes("Mobile")) return "Android Phone"
  if (userAgent.includes("Android")) return "Android Tablet"
  if (/(Windows|Macintosh|Linux)/.test(userAgent)) return "Desktop"
  return "Unknown"
}
