"use client"

export interface Notification {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  message: string
  timestamp: number
  duration?: number
}

class NotificationManager {
  private static instance: NotificationManager
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.notifications]))
  }

  add(notification: Omit<Notification, "id" | "timestamp">) {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      duration: notification.duration || 5000,
    }

    this.notifications.push(newNotification)
    this.notify()

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(newNotification.id)
      }, newNotification.duration)
    }

    return newNotification.id
  }

  remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id)
    this.notify()
  }

  clear() {
    this.notifications = []
    this.notify()
  }

  success(title: string, message: string, duration?: number) {
    return this.add({ type: "success", title, message, duration })
  }

  error(title: string, message: string, duration?: number) {
    return this.add({ type: "error", title, message, duration })
  }

  info(title: string, message: string, duration?: number) {
    return this.add({ type: "info", title, message, duration })
  }

  warning(title: string, message: string, duration?: number) {
    return this.add({ type: "warning", title, message, duration })
  }
}

export const notificationManager = NotificationManager.getInstance()
