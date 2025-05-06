"use client"

// Check if notifications are supported
export function areNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!areNotificationsSupported()) {
    throw new Error("Notifications are not supported in this browser")
  }

  return await Notification.requestPermission()
}

// Check if notification permission is granted
export function hasNotificationPermission(): boolean {
  if (!areNotificationsSupported()) {
    return false
  }

  return Notification.permission === "granted"
}

// Schedule a notification
export function scheduleNotification(title: string, options: NotificationOptions, delayMs: number): number {
  if (!hasNotificationPermission()) {
    throw new Error("Notification permission not granted")
  }

  return window.setTimeout(() => {
    new Notification(title, options)
  }, delayMs)
}

// Cancel a scheduled notification
export function cancelScheduledNotification(id: number): void {
  window.clearTimeout(id)
}

// Show a notification immediately
export function showNotification(title: string, options: NotificationOptions): Notification | null {
  if (!hasNotificationPermission()) {
    console.warn("Notification permission not granted")
    return null
  }

  return new Notification(title, options)
}
