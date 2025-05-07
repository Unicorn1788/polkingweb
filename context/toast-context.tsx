"use client"

import { createContext, useContext, useCallback, useRef } from "react"
import { Toaster, toast } from "sonner"
import { logger } from "@/lib/logger"

type ToastType = "success" | "error" | "warning" | "info"

interface ToastContextType {
  showToast: (params: { type: ToastType; title: string; message: string; duration?: number }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastRef = useRef(toast)

  const showToast = useCallback(({ 
    type, 
    title, 
    message,
    duration = 5000 
  }: { 
    type: ToastType; 
    title: string; 
    message: string;
    duration?: number 
  }) => {
    // Log errors to help with debugging
    if (type === "error") {
      logger.error(`Toast Error: ${title} - ${message}`);
    }

    // Show new toast based on type
    toastRef.current[type](title, {
      description: message,
      duration: duration,
      position: "top-right",
    })
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
            description: "group-[.toast]:text-muted-foreground",
            actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
            cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
            closeButton: "group-[.toast]:order-last"
          }
        }}
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
