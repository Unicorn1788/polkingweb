"use client"

import type { ReactNode } from "react"

// This is a simplified provider that doesn't rely on problematic exports
export function ReownProvider({ children }: { children: ReactNode }) {
  // Simply render children without any problematic providers
  return <>{children}</>
}
