import type { DonationRecord } from "@/types/user-data"

export const PI_DONATION_PRESETS = [1, 5, 10, 20] as const
export const PI_DONATION_MIN = 0.1

export function formatPiAmount(amount: number) {
  const normalized = Number.isInteger(amount) ? amount.toString() : amount.toFixed(2).replace(/\.00$/, "")
  return `${normalized} π`
}

export function getDonationImpactMessage(amount: number) {
  if (amount >= 20) return "Helps fund major app improvements and launch support."
  if (amount >= 10) return "Supports Pi payments, app polish, and feature work."
  if (amount >= 5) return "Helps maintain development and platform costs."
  return "Supports BrightSide News and ongoing development."
}

export function getDonationStatusTone(status: DonationRecord["status"]) {
  switch (status) {
    case "completed":
      return "default" as const
    case "approved":
    case "pending":
      return "secondary" as const
    case "cancelled":
      return "outline" as const
    case "failed":
      return "destructive" as const
    default:
      return "outline" as const
  }
}
