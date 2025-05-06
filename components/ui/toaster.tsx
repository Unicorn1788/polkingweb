"use client"

import { useEffect } from "react"
import { useToast } from "@/context/toast-context"
import { motion, AnimatePresence } from "framer-motion"

export function Toaster() {
  const { toast, hideToast } = useToast()

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast()
      }, toast.duration || 3000)

      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500/20 border border-green-500/50"
                : toast.type === "error"
                ? "bg-red-500/20 border border-red-500/50"
                : "bg-blue-500/20 border border-blue-500/50"
            }`}
          >
            <h3 className="font-medium text-white mb-1">{toast.title}</h3>
            <p className="text-sm text-white/80">{toast.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
