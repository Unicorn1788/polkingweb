"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, Trash2, Clock, AlertTriangle, CheckCircle, FileText, Gift, X, Info } from "lucide-react"
import { useNotifications, type Notification, type NotificationType } from "@/context/notification-context"
import { usePerformanceMode } from "@/hooks/use-performance-mode"

interface NotificationProps {
  variant?: "bell" | "toast"
  className?: string
}

export default function Notification({ variant = "bell", className = "" }: NotificationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAllNotifications } =
    useNotifications()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { performanceLevel, prefersReducedMotion } = usePerformanceMode()
  const [activeToast, setActiveToast] = useState<Notification | null>(null)
  const [isToastVisible, setIsToastVisible] = useState(false)

  // Close dropdown when clicking outside
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    },
    [dropdownRef],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  // Show new notifications as toasts
  useEffect(() => {
    if (variant === "toast") {
      const stakingNotifications = notifications.filter(
        (n) =>
          !n.read &&
          (n.title.includes("Stake") ||
            n.title.includes("Contract") ||
            n.title.includes("Tier") ||
            n.title.includes("Rewards")),
      )

      if (stakingNotifications.length > 0) {
        const newest = stakingNotifications[0]
        setActiveToast(newest)
        setIsToastVisible(true)

        const timer = setTimeout(() => {
          setIsToastVisible(false)
          setTimeout(() => markAsRead(newest.id), 500)
        }, 5000)

        return () => clearTimeout(timer)
      }
    }
  }, [notifications, markAsRead, variant])

  // Format timestamp to relative time
  const formatRelativeTime = useCallback((timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }, [])

  // Get color based on notification type
  const getTypeColor = useCallback((type: NotificationType) => {
    switch (type) {
      case "info":
        return "bg-blue-500"
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-amber-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }, [])

  // Get icon based on notification type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case "info":
      default:
        return <Info className="w-4 h-4 text-blue-400" />
    }
  }

  // Get background color for toast
  const getToastBackgroundColor = () => {
    if (!activeToast) return "bg-black/80"

    switch (activeToast.type) {
      case "success":
        return "bg-green-900/20"
      case "warning":
        return "bg-amber-900/20"
      case "error":
        return "bg-red-900/20"
      default:
        return "bg-blue-900/20"
    }
  }

  // Animation variants based on performance level
  const getDropdownVariants = () => {
    if (performanceLevel === "low") {
      return {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
      }
    }

    return {
      hidden: {
        opacity: 0,
        y: -10,
        scale: 0.95,
        transition: { duration: 0.2 },
      },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.2 },
      },
    }
  }

  const getBellShakeVariants = () => {
    if (prefersReducedMotion || performanceLevel === "low") {
      return {
        initial: {},
        shake: {},
      }
    }

    return {
      initial: { rotate: 0 },
      shake: {
        rotate: performanceLevel === "high" ? [0, 15, -15, 10, -10, 5, -5, 0] : [0, 10, -10, 5, -5, 0],
        transition: {
          duration: performanceLevel === "high" ? 0.6 : 0.4,
          ease: "easeInOut",
        },
      },
    }
  }

  const dropdownVariants = getDropdownVariants()
  const bellShakeVariants = getBellShakeVariants()

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id)
    if (notification.link) {
      window.location.href = notification.link
    }
  }

  const handleToastClose = () => {
    setIsToastVisible(false)
    if (activeToast) {
      setTimeout(() => markAsRead(activeToast.id), 500)
    }
  }

  if (variant === "toast") {
    return (
      <AnimatePresence>
        {isToastVisible && activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 max-w-sm w-full pointer-events-auto"
          >
            <div className={`rounded-lg shadow-lg border border-white/10 backdrop-blur-md ${getToastBackgroundColor()} p-4`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(activeToast.type)}</div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">{activeToast.title}</p>
                  <p className="mt-1 text-sm text-white/80">{activeToast.message}</p>
                  {activeToast.link && (
                    <div className="mt-2">
                      <a href={activeToast.link} className="text-xs font-medium text-[#a58af8] hover:text-[#a58af8]/80">
                        View Details
                      </a>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-transparent rounded-md inline-flex text-white/60 hover:text-white focus:outline-none"
                    onClick={handleToastClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className="relative p-2 rounded-full text-white/80 hover:text-white focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
        variants={bellShakeVariants}
        animate={unreadCount > 0 && !prefersReducedMotion ? "shake" : "initial"}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ""}`}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[18px] h-[18px]">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
        {isOpen && (
          <motion.div
            className="fixed sm:absolute inset-x-0 sm:inset-x-auto top-16 sm:top-auto sm:mt-2 mx-auto sm:mx-0 sm:right-0 w-[calc(100%-32px)] sm:w-80 max-h-[calc(100vh-80px)] sm:max-h-[70vh] bg-gradient-to-b from-[#0d0d22] to-[#1a0f2e] rounded-lg shadow-lg overflow-hidden z-50 sm:max-w-[420px]"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
          >
            <div className="flex items-center justify-between p-3 border-b border-gray-700">
              <h3 className="text-base sm:text-lg font-semibold text-white">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] sm:text-xs text-white/70 hover:text-white flex items-center gap-1"
                    aria-label="Mark all as read"
                  >
                    <Check className="h-3 w-3" />
                    <span className="hidden xs:inline">Mark all read</span>
                    <span className="xs:hidden">Read all</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[10px] sm:text-xs text-white/70 hover:text-white flex items-center gap-1"
                    aria-label="Clear all notifications"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden xs:inline">Clear all</span>
                    <span className="xs:hidden">Clear</span>
                  </button>
                )}
              </div>
            </div>

            <div
              className="overflow-y-auto overscroll-contain"
              style={{
                maxHeight: "calc(70vh - 48px)",
                WebkitOverflowScrolling: "touch",
              }}
              role="list"
              aria-label="Notifications"
            >
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-white/60">
                  <p>No notifications</p>
                </div>
              ) : (
                <AnimatePresence>
                  {notifications.map((notification) => (
                    <motion.div
                      key={`${notification.id}-${notification.timestamp}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 border-b border-[#a58af8]/10 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#a58af8]/10 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white mb-1">{notification.title}</p>
                          <p className="text-xs text-gray-400">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notification.timestamp)}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 
