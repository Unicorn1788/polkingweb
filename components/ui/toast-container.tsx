"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Toast, type ToastProps } from "./toast"

interface ToastContainerProps {
  toasts: ToastProps[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Create portal to render toasts at the root level
  return createPortal(
    <div
      className="fixed bottom-0 right-0 z-50 p-2 sm:p-4 flex flex-col items-end space-y-2 pointer-events-none"
      style={{
        maxWidth: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto w-full max-w-sm">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>,
    document.body,
  )
}
