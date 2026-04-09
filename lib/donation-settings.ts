export interface DonationMethod {
  id: string
  name: string
  type: "paypal" | "stripe" | "crypto" | "pi"
  address: string
  isActive: boolean
  description?: string
}

export interface DonationRecord {
  id: string
  amount: number
  currency: string
  method: string
  donorName?: string
  donorMessage?: string
  status: "completed" | "pending" | "failed"
  timestamp: string
  transactionId?: string
}

export class DonationSettings {
  private static instance: DonationSettings
  private methods: DonationMethod[] = []
  private records: DonationRecord[] = []

  static getInstance(): DonationSettings {
    if (!DonationSettings.instance) {
      DonationSettings.instance = new DonationSettings()
    }
    return DonationSettings.instance
  }

  getMethods(): DonationMethod[] {
    return [...this.methods]
  }

  getRecords(): DonationRecord[] {
    return [...this.records]
  }

  addMethod(method: Omit<DonationMethod, "id">): void {
    const newMethod: DonationMethod = {
      ...method,
      id: `method_${Date.now()}`,
    }
    this.methods.push(newMethod)
    this.saveToStorage()
  }

  updateMethod(id: string, updates: Partial<DonationMethod>): void {
    const index = this.methods.findIndex((m) => m.id === id)
    if (index !== -1) {
      this.methods[index] = { ...this.methods[index], ...updates }
      this.saveToStorage()
    }
  }

  removeMethod(id: string): void {
    this.methods = this.methods.filter((m) => m.id !== id)
    this.saveToStorage()
  }

  addRecord(record: Omit<DonationRecord, "id" | "timestamp">): void {
    const newRecord: DonationRecord = {
      ...record,
      id: `record_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    this.records.unshift(newRecord)
    this.saveToStorage()
  }

  private saveToStorage(): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("brightside-donation-methods", JSON.stringify(this.methods))
      localStorage.setItem("brightside-donation-records", JSON.stringify(this.records))
    }
  }

  loadFromStorage(): void {
    if (typeof window !== "undefined") {
      const storedMethods = localStorage.getItem("brightside-donation-methods")
      const storedRecords = localStorage.getItem("brightside-donation-records")

      if (storedMethods) {
        try {
          this.methods = JSON.parse(storedMethods)
        } catch (error) {
          console.error("Failed to load donation methods:", error)
        }
      }

      if (storedRecords) {
        try {
          this.records = JSON.parse(storedRecords)
        } catch (error) {
          console.error("Failed to load donation records:", error)
        }
      }

      // Initialize with default methods if none exist
      if (this.methods.length === 0) {
        this.initializeDefaultMethods()
      }
    }
  }

  private initializeDefaultMethods(): void {
    const defaultMethods: Omit<DonationMethod, "id">[] = [
      {
        name: "PayPal",
        type: "paypal",
        address: "donations@brightsidenews.com",
        isActive: true,
        description: "Secure PayPal donations",
      },
      {
        name: "Pi Network",
        type: "pi",
        address: "@brightsidenews",
        isActive: true,
        description: "Pi cryptocurrency donations",
      },
    ]

    defaultMethods.forEach((method) => this.addMethod(method))
  }
}
