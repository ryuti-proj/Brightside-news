"use client"

import { useState, useEffect } from "react"
import { notificationManager, type Notification } from "@/lib/notifications"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const unsubscribe = notificationManager.subscribe(setNotifications)
    return unsubscribe
  }, [])

  return {
    notifications,
    success: notificationManager.success.bind(notificationManager),
    error: notificationManager.error.bind(notificationManager),
    info: notificationManager.info.bind(notificationManager),
    warning: notificationManager.warning.bind(notificationManager),
    remove: notificationManager.remove.bind(notificationManager),
    clear: notificationManager.clear.bind(notificationManager),
  }
}
