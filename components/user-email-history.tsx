"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { emailService, type EmailNotification } from "@/lib/email-service"
import { useNotifications } from "@/hooks/use-notifications"
import { Mail, Clock, Eye, Trash2, RefreshCw, Shield, Settings, UserPlus, LogIn } from "lucide-react"

export function UserEmailHistory() {
  const [emailHistory, setEmailHistory] = useState<EmailNotification[]>([])
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const { success, warning } = useNotifications()

  useEffect(() => {
    loadEmailHistory()
  }, [])

  const loadEmailHistory = () => {
    setIsLoading(true)
    try {
      const history = emailService.getEmailHistory()
      setEmailHistory(history)
    } catch (error) {
      console.error("Failed to load email history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all email history? This action cannot be undone.")) {
      emailService.clearEmailHistory()
      setEmailHistory([])
      setSelectedEmail(null)
      warning("Email History Cleared", "All email notifications have been removed from your history.")
    }
  }

  const getEmailTypeIcon = (type: EmailNotification["type"]) => {
    switch (type) {
      case "account_created":
        return <UserPlus className="w-4 h-4 text-green-500" />
      case "password_changed":
        return <Shield className="w-4 h-4 text-orange-500" />
      case "preferences_updated":
        return <Settings className="w-4 h-4 text-blue-500" />
      case "login_alert":
        return <LogIn className="w-4 h-4 text-red-500" />
      default:
        return <Mail className="w-4 h-4 text-gray-500" />
    }
  }

  const getEmailTypeBadge = (type: EmailNotification["type"]) => {
    const configs = {
      account_created: { label: "Welcome", variant: "default" as const, className: "bg-green-100 text-green-800" },
      password_changed: {
        label: "Security",
        variant: "secondary" as const,
        className: "bg-orange-100 text-orange-800",
      },
      preferences_updated: {
        label: "Settings",
        variant: "outline" as const,
        className: "bg-blue-100 text-blue-800",
      },
      login_alert: { label: "Alert", variant: "destructive" as const, className: "bg-red-100 text-red-800" },
    }

    const config = configs[type]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500" />
            Email Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300">View your email notification history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadEmailHistory} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {emailHistory.length > 0 && (
            <Button variant="outline" onClick={handleClearHistory} size="sm" className="text-red-600 bg-transparent">
              <Trash2 className="w-4 h-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </div>

      {emailHistory.length === 0 ? (
        <Card className="border-orange-200 dark:border-gray-600">
          <CardContent className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">No Email History</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Email notifications will appear here when they are sent to your account.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Recent Notifications ({emailHistory.length})
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {emailHistory.map((email, index) => {
                const { date, time } = formatDate(email.timestamp)
                return (
                  <Card
                    key={index}
                    className={`cursor-pointer transition-all hover:shadow-md border-orange-200 dark:border-gray-600 ${
                      selectedEmail === email ? "ring-2 ring-blue-500 border-blue-300" : ""
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          {getEmailTypeIcon(email.type)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-800 dark:text-white truncate">
                              {email.template.subject}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {date} at {time}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getEmailTypeBadge(email.type)}
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Email Preview */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Email Preview</h2>
            {selectedEmail ? (
              <Card className="border-orange-200 dark:border-gray-600">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getEmailTypeIcon(selectedEmail.type)}
                      Email Details
                    </CardTitle>
                    {getEmailTypeBadge(selectedEmail.type)}
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">To:</label>
                    <p className="text-gray-800 dark:text-white break-all">{selectedEmail.to}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Subject:</label>
                    <p className="text-gray-800 dark:text-white">{selectedEmail.template.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Sent:</label>
                    <p className="text-gray-800 dark:text-white">
                      {formatDate(selectedEmail.timestamp).date} at {formatDate(selectedEmail.timestamp).time}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                      Content Preview:
                    </label>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <div
                        className="text-sm text-gray-700 dark:text-gray-300 prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{
                          __html: selectedEmail.template.html.replace(/<style[^>]*>.*?<\/style>/gs, ""),
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-orange-200 dark:border-gray-600">
                <CardContent className="p-12 text-center">
                  <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">Select an Email</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Click on any email from the list to view its details and content.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {emailHistory.length > 0 && (
        <Card className="border-orange-200 dark:border-gray-600 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700 dark:to-gray-600">
          <CardHeader>
            <CardTitle className="text-lg">Email Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  type: "account_created" as const,
                  label: "Welcome",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  type: "password_changed" as const,
                  label: "Security",
                  color: "text-orange-600 dark:text-orange-400",
                },
                {
                  type: "preferences_updated" as const,
                  label: "Settings",
                  color: "text-blue-600 dark:text-blue-400",
                },
                {
                  type: "login_alert" as const,
                  label: "Alerts",
                  color: "text-red-600 dark:text-red-400",
                },
              ].map(({ type, label, color }) => {
                const count = emailHistory.filter((email) => email.type === type).length
                return (
                  <div key={type} className="text-center">
                    <div className={`text-2xl font-bold ${color}`}>{count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
