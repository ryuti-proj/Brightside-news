"use client"

import { useState, useEffect } from "react"
import { BackupSystem, type BackupData } from "@/lib/backup-system"

export function useBackup() {
  const [backups, setBackups] = useState<BackupData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const backupSystem = BackupSystem.getInstance()

  useEffect(() => {
    backupSystem.loadFromStorage()
    setBackups(backupSystem.getBackups())
  }, [])

  const createBackup = async (data: any, description: string) => {
    setIsLoading(true)
    try {
      await backupSystem.createBackup(data, description)
      setBackups(backupSystem.getBackups())
    } finally {
      setIsLoading(false)
    }
  }

  const restoreBackup = async (backupId: string) => {
    setIsLoading(true)
    try {
      const data = await backupSystem.restoreBackup(backupId)
      return data
    } finally {
      setIsLoading(false)
    }
  }

  const deleteBackup = (backupId: string) => {
    backupSystem.deleteBackup(backupId)
    setBackups(backupSystem.getBackups())
  }

  return {
    backups,
    isLoading,
    createBackup,
    restoreBackup,
    deleteBackup,
  }
}
