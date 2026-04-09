"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBackup } from "@/hooks/use-backup"
import { Download, Upload, RotateCcw, Trash2, Clock, CheckCircle } from "lucide-react"

export function BackupPanel() {
  const { backups, isLoading, createBackup, restoreBackup, deleteBackup } = useBackup()
  const [isRestoring, setIsRestoring] = useState(false)

  const handleCreateBackup = async () => {
    const mockData = {
      stories: [],
      users: [],
      settings: {},
      timestamp: new Date().toISOString(),
    }
    await createBackup(mockData, `Manual backup - ${new Date().toLocaleTimeString()}`)
  }

  const handleRestore = async (backupId: string) => {
    if (!confirm("Are you sure you want to restore from this backup? Current data will be replaced.")) {
      return
    }

    setIsRestoring(true)
    try {
      await restoreBackup(backupId)
      alert("Backup restored successfully!")
    } catch (error) {
      alert("Failed to restore backup")
    } finally {
      setIsRestoring(false)
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatSize = (size: number) => {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Backup Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={handleCreateBackup} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
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
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {backups.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No backups available</p>
            ) : (
              backups.map((backup, index) => (
                <div key={backup.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{backup.description}</p>
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(backup.timestamp)} • {formatSize(backup.size)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => handleRestore(backup.id)} disabled={isRestoring} variant="ghost" size="sm">
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deleteBackup(backup.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
