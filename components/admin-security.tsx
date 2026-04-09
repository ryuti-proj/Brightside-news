"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Shield, AlertTriangle, Eye, Lock, Activity, CheckCircle, XCircle, Clock, Globe } from "lucide-react"

export function AdminSecurity() {
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: true,
    loginNotifications: true,
    sessionTimeout: true,
    ipWhitelist: false,
    bruteForceProtection: true,
    encryptionEnabled: true,
  })

  const securityEvents = [
    {
      id: 1,
      type: "success",
      event: "Admin login successful",
      ip: "192.168.1.100",
      location: "New York, US",
      time: "Just now",
    },
    {
      id: 2,
      type: "warning",
      event: "Failed login attempt",
      ip: "45.123.45.67",
      location: "Unknown",
      time: "2 hours ago",
    },
    {
      id: 3,
      type: "info",
      event: "Password changed",
      ip: "192.168.1.100",
      location: "New York, US",
      time: "1 day ago",
    },
    {
      id: 4,
      type: "success",
      event: "System backup completed",
      ip: "System",
      location: "Server",
      time: "2 days ago",
    },
    {
      id: 5,
      type: "warning",
      event: "Multiple failed login attempts",
      ip: "123.45.67.89",
      location: "Unknown",
      time: "3 days ago",
    },
  ]

  const activeSessions = [
    {
      id: 1,
      device: "Chrome on Windows",
      ip: "192.168.1.100",
      location: "New York, US",
      lastActive: "Active now",
      current: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      ip: "192.168.1.105",
      location: "New York, US",
      lastActive: "2 hours ago",
      current: false,
    },
  ]

  const handleSettingChange = (setting: keyof typeof securitySettings) => {
    setSecuritySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  const terminateSession = (sessionId: number) => {
    if (confirm("Are you sure you want to terminate this session?")) {
      // Handle session termination
      alert("Session terminated successfully")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Security Dashboard</h2>
        <p className="text-gray-600">Monitor security status and manage access controls</p>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Status</p>
                <p className="text-lg font-bold text-green-600">Secure</p>
                <p className="text-xs text-gray-500">All systems protected</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Logins</p>
                <p className="text-lg font-bold text-red-600">3</p>
                <p className="text-xs text-gray-500">Last 24 hours</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-lg font-bold text-blue-600">{activeSessions.length}</p>
                <p className="text-xs text-gray-500">Current sessions</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-600">Require 2FA for admin access</p>
            </div>
            <Switch
              checked={securitySettings.twoFactorAuth}
              onCheckedChange={() => handleSettingChange("twoFactorAuth")}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">Login Notifications</Label>
              <p className="text-sm text-gray-600">Email notifications for new logins</p>
            </div>
            <Switch
              checked={securitySettings.loginNotifications}
              onCheckedChange={() => handleSettingChange("loginNotifications")}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">Session Timeout</Label>
              <p className="text-sm text-gray-600">Auto-logout after 24 hours</p>
            </div>
            <Switch
              checked={securitySettings.sessionTimeout}
              onCheckedChange={() => handleSettingChange("sessionTimeout")}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">IP Whitelist</Label>
              <p className="text-sm text-gray-600">Restrict access to specific IPs</p>
            </div>
            <Switch checked={securitySettings.ipWhitelist} onCheckedChange={() => handleSettingChange("ipWhitelist")} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">Brute Force Protection</Label>
              <p className="text-sm text-gray-600">Block IPs after failed attempts</p>
            </div>
            <Switch
              checked={securitySettings.bruteForceProtection}
              onCheckedChange={() => handleSettingChange("bruteForceProtection")}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <Label className="font-medium">Data Encryption</Label>
              <p className="text-sm text-gray-600">Encrypt sensitive data at rest</p>
            </div>
            <Switch
              checked={securitySettings.encryptionEnabled}
              onCheckedChange={() => handleSettingChange("encryptionEnabled")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Active Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${session.current ? "bg-green-500" : "bg-gray-400"}`} />
                  <div>
                    <p className="font-medium text-gray-800">{session.device}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {session.ip}
                      </span>
                      <span>{session.location}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.lastActive}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.current && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Current
                    </Badge>
                  )}
                  {!session.current && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => terminateSession(session.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Events Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full">
                    {event.type === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
                    {event.type === "warning" && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    {event.type === "info" && <Activity className="w-5 h-5 text-blue-500" />}
                    {event.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{event.event}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>IP: {event.ip}</span>
                      <span>Location: {event.location}</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
                <Badge
                  variant={
                    event.type === "success"
                      ? "default"
                      : event.type === "warning"
                        ? "secondary"
                        : event.type === "info"
                          ? "outline"
                          : "destructive"
                  }
                >
                  {event.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
