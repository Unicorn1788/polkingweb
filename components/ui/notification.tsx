"use client"

import { useEffect } from "react"
import { useNotification } from "@/context/notification-context"
import { motion, AnimatePresence } from "framer-motion"

export function Notification() {
  const { notification, hideNotification } = useNotification()

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideNotification()
      }, notification.duration || 3000)

      return () => clearTimeout(timer)
    }
  }, [notification, hideNotification])

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50"
        >
          <div
            className={`px-4 py-3 rounded-lg shadow-lg ${
              notification.type === "success"
                ? "bg-green-500/20 border border-green-500/50"
                : notification.type === "error"
                ? "bg-red-500/20 border border-red-500/50"
                : "bg-blue-500/20 border border-blue-500/50"
            }`}
          >
            <h3 className="font-medium text-white mb-1">{notification.title}</h3>
            <p className="text-sm text-white/80">{notification.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 
