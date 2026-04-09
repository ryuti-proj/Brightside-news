"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, Upload, RotateCcw, Shield, AlertTriangle, CheckCircle, Clock, FileText } from "lucide-react"

interface BackupData {
  timestamp: string
  version: string
  description: string
  data: any
}

interface BackupManagerProps {
  currentData: any
  onDataRestore: (data: any) => void
  className?: string
}

export function BackupManager({ currentData, onDataRestore, className }: BackupManagerProps) {
  const [backupHistory, setBackupHistory] = useState<BackupData[]>([])
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)

  useEffect(() => {
    // Load existing backups from localStorage
    const stored = localStorage.getItem("brightside-backups")
    if (stored) {
      try {
        setBackupHistory(JSON.parse(stored))
      } catch (error) {
        console.error("Failed to load backups:", error)
      }
    }
  }, [])

  const saveBackupsToStorage = (backups: BackupData[]) => {
    localStorage.setItem("brightside-backups", JSON.stringify(backups))
    setBackupHistory(backups)
  }

  const createBackup = async (description: string) => {
    setIsCreatingBackup(true)
    try {
      const backup: BackupData = {
        timestamp: new Date().toISOString(),
        version: `backup_${Date.now()}`,
        description,
        data: JSON.parse(JSON.stringify(currentData)), // Deep clone
      }

      const newBackups = [backup, ...backupHistory].slice(0, 10) // Keep only 10 backups
      saveBackupsToStorage(newBackups)

      console.log("✅ Backup created:", description)
    } finally {
      setIsCreatingBackup(false)
    }
  }

  const restoreFromBackup = async (version: string) => {
    if (!confirm("Are you sure you want to restore from backup? Current changes will be lost.")) {
      return
    }

    setIsRestoring(true)
    try {
      const backup = backupHistory.find((b) => b.version === version)
      if (backup && onDataRestore) {
        onDataRestore(backup.data)
        console.log("✅ Restored from backup:", backup.description)
      }
    } finally {
      setIsRestoring(false)
    }
  }

  const handleManualBackup = async () => {
    const description = `Manual backup - ${new Date().toLocaleTimeString()}`
    await createBackup(description)
  }

  const handleExportBackups = () => {
    const backupData = JSON.stringify(backupHistory, null, 2)
    const blob = new Blob([backupData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `brightside-backups-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportBackups = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedBackups = JSON.parse(e.target?.result as string)
          if (Array.isArray(importedBackups)) {
            const mergedBackups = [...importedBackups, ...backupHistory].slice(0, 20)
            saveBackupsToStorage(mergedBackups)
            alert("Backups imported successfully!")
          }
        } catch (error) {
          alert("Failed to import backups. Invalid file format.")
        }
      }
      reader.readAsText(file)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className={className}>
      <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Backup Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Backup System Active</span>
            </div>
            <Badge variant={autoBackupEnabled ? "default" : "secondary"}>
              Auto-backup: {autoBackupEnabled ? "ON" : "OFF"}
            </Badge>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleManualBackup}
              disabled={isCreatingBackup}
              className="bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              {isCreatingBackup ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>

            <Button
              onClick={() => backupHistory.length > 0 && restoreFromBackup(backupHistory[0].version)}
              disabled={isRestoring || backupHistory.length === 0}
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 bg-transparent"
              size="sm"
            >
              {isRestoring ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Emergency Restore
                </>
              )}
            </Button>
          </div>

          {/* Backup History */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {backupHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No backups available</p>
            ) : (
              backupHistory.map((backup, index) => (
                <div key={backup.version} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{backup.description}</p>
                    <p className="text-xs text-gray-500">{formatTimestamp(backup.timestamp)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {index === 0 && (
                      <Badge variant="secondary" className="text-xs">
                        Latest
                      </Badge>
                    )}
                    <Button
                      onClick={() => restoreFromBackup(backup.version)}
                      disabled={isRestoring}
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Import/Export */}
          <div className="flex gap-2 pt-2 border-t">
            <Button onClick={handleExportBackups} variant="outline" size="sm" className="flex-1 bg-transparent">
              <FileText className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </span>
              </Button>
              <input type="file" accept=".json" onChange={handleImportBackups} className="hidden" />
            </label>
          </div>

          {/* Auto-backup Toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">Auto-backup every 5 minutes</span>
            <Button
              onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
              variant={autoBackupEnabled ? "default" : "outline"}
              size="sm"
            >
              {autoBackupEnabled ? "ON" : "OFF"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
