/**
 * Formats a number with thousands separators
 * @param value The number to format
 * @param maximumFractionDigits Maximum number of decimal places (default: 2)
 * @returns Formatted number string with thousands separators
 */
export function formatNumber(value: number, maximumFractionDigits = 2): string {
  if (isNaN(value)) return "0"

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value)
}

/**
 * Parses a formatted number string back to a number
 * @param str The formatted string to parse
 * @returns The parsed number
 */
export function parseFormattedNumber(str: string): number {
  if (!str) return 0

  try {
    // Remove all spaces and non-numeric characters except decimal point
    const cleaned = str.replace(/[^\d.]/g, "")
    const result = Number.parseFloat(cleaned)
    return isNaN(result) ? 0 : result
  } catch (error) {
    console.error("Error parsing formatted number:", error)
    return 0
  }
}

/**
 * Formats a number as currency
 * @param amount The amount to format
 * @param currency The currency code
 * @param decimals Number of decimal places
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "POL", decimals = 2): string {
  if (isNaN(amount)) return `0 ${currency}`

  try {
    const formatted = amount.toFixed(decimals)
    return `${formatted} ${currency}`
  } catch (error) {
    console.error("Error formatting currency:", error)
    return `0 ${currency}`
  }
}
