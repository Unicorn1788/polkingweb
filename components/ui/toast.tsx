"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, CheckCircle, AlertCircle, Info, ExternalLink } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface ToastAction {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: ToastAction
  onClose: (id: string) => void
}

export function Toast({ id, type, title, message, duration = 5000, action, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(id), 300) // Allow animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
  }

  const colors = {
    success: "bg-green-500/10 border-green-500/30",
    error: "bg-red-500/10 border-red-500/30",
    warning: "bg-amber-500/10 border-amber-500/30",
    info: "bg-blue-500/10 border-blue-500/30",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20, scale: isVisible ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
      className={`w-full max-w-sm rounded-lg border ${colors[type]} backdrop-blur-md shadow-lg overflow-hidden`}
      style={{
        width: "calc(100% - 16px)",
        maxWidth: "420px",
        margin: "0 auto",
      }}
    >
      <div className="p-2 sm:p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 hidden xs:block">{icons[type]}</div>
          <div
            className={`w-0 flex-1 pt-0.5 ${!message ? "flex items-center" : ""} ${icons[type] ? "ml-0 xs:ml-3" : ""}`}
          >
            <div className="flex xs:hidden items-center mb-1">
              {icons[type]}
              <span className="sr-only">{type}:</span>
            </div>
            <p className="text-sm font-medium text-white break-words">{title}</p>
            {message && <p className="mt-1 text-xs sm:text-sm text-white/70 break-words">{message}</p>}

            {/* Action button */}
            {action && (
              <div className="mt-2 sm:mt-3">
                <button
                  onClick={action.onClick}
                  className="inline-flex items-center px-3 py-1.5 sm:px-3 sm:py-1.5 border border-transparent text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  {action.icon || <ExternalLink className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                  {action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-2 sm:ml-4 flex-shrink-0 flex">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(() => onClose(id), 300)
              }}
              className="bg-transparent rounded-md inline-flex text-white/50 hover:text-white focus:outline-none p-1"
            >
              <span className="sr-only">Close</span>
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
