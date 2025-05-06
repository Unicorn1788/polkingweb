"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"

// Define notification types
export type NotificationType = "info" | "success" | "warning" | "error"

// Define notification interface
export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  timestamp: number
  read: boolean
  link?: string
  duration?: number
}

// Define context interface
interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAllNotifications: () => void
  notification: Notification | null
  showNotification: (notification: Notification) => void
  hideNotification: () => void
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Provider component
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notification, setNotification] = useState<Notification | null>(null)

  // Load notifications from localStorage on mount
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("notifications")
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications))
      }
    } catch (error) {
      console.error("Failed to load notifications from localStorage:", error)
    }
  }, [])

  // Update unread count when notifications change
  useEffect(() => {
    const count = notifications.filter((notification) => !notification.read).length
    setUnreadCount(count)

    // Save to localStorage
    try {
      localStorage.setItem("notifications", JSON.stringify(notifications))
    } catch (error) {
      console.error("Failed to save notifications to localStorage:", error)
    }
  }, [notifications])

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: uuidv4(),
      timestamp: Date.now(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }, [])

  // Mark a notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  // Remove a notification
  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }, [])

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const showNotification = useCallback((newNotification: Notification) => {
    setNotification(newNotification)
  }, [])

  const hideNotification = useCallback(() => {
    setNotification(null)
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        notification,
        showNotification,
        hideNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use the notification context
export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
