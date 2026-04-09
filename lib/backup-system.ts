export interface BackupData {
  id: string
  timestamp: string
  version: string
  description: string
  data: any
  size: number
}

export class BackupSystem {
  private static instance: BackupSystem
  private backups: BackupData[] = []
  private maxBackups = 10

  static getInstance(): BackupSystem {
    if (!BackupSystem.instance) {
      BackupSystem.instance = new BackupSystem()
    }
    return BackupSystem.instance
  }

  async createBackup(data: any, description: string): Promise<BackupData> {
    const backup: BackupData = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      version: `v${Date.now()}`,
      description,
      data: JSON.parse(JSON.stringify(data)),
      size: JSON.stringify(data).length,
    }

    this.backups.unshift(backup)
    if (this.backups.length > this.maxBackups) {
      this.backups = this.backups.slice(0, this.maxBackups)
    }

    this.saveToStorage()
    return backup
  }

  getBackups(): BackupData[] {
    return [...this.backups]
  }

  async restoreBackup(backupId: string): Promise<any> {
    const backup = this.backups.find((b) => b.id === backupId)
    if (!backup) {
      throw new Error("Backup not found")
    }
    return backup.data
  }

  deleteBackup(backupId: string): void {
    this.backups = this.backups.filter((b) => b.id !== backupId)
    this.saveToStorage()
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("brightside-backups", JSON.stringify(this.backups))
    }
  }

  loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("brightside-backups")
      if (stored) {
        try {
          this.backups = JSON.parse(stored)
        } catch (error) {
          console.error("Failed to load backups:", error)
        }
      }
    }
  }
}
