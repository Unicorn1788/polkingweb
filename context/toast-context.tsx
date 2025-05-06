"use client"

import { createContext, useContext, useCallback, type ReactNode } from "react"
import { toast, Toaster } from "sonner"

type ToastType = "success" | "error" | "warning" | "info" | "loading"

type Toast = {
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastContextType = {
  showToast: (toast: Toast) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback(({ type, title, message, duration = 5000, action }: Toast) => {
    const options = {
      duration,
      action: action ? {
        label: action.label,
        onClick: action.onClick,
      } : undefined,
      className: "bg-background border-border",
      style: {
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        border: "1px solid hsl(var(--border))",
      },
    }

    switch (type) {
      case "success":
        toast.success(title, { description: message, ...options })
        break
      case "error":
        toast.error(title, { description: message, ...options })
        break
      case "warning":
        toast.warning(title, { description: message, ...options })
        break
      case "info":
        toast.info(title, { description: message, ...options })
        break
      case "loading":
        toast.loading(title, { description: message, ...options })
        break
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    toast.dismiss(id)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <Toaster 
        position="top-right"
        expand={true}
        richColors
        closeButton
        theme="dark"
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
