"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

export function ToastContainer() {
  const { notifications, remove } = useNotifications()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} onClose={() => remove(notification.id)} />
      ))}
    </div>
  )
}

interface ToastProps {
  notification: {
    id: string
    type: "success" | "error" | "info" | "warning"
    title: string
    message: string
    timestamp: number
  }
  onClose: () => void
}

function Toast({ notification, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-green-200"
      case "error":
        return "border-red-200"
      case "warning":
        return "border-yellow-200"
      case "info":
      default:
        return "border-blue-200"
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50"
      case "error":
        return "bg-red-50"
      case "warning":
        return "bg-yellow-50"
      case "info":
      default:
        return "bg-blue-50"
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
        max-w-sm w-full bg-white border-l-4 ${getBorderColor()} ${getBgColor()} 
        rounded-lg shadow-lg p-4 pointer-events-auto
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-gray-900">{notification.title}</h3>
          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
