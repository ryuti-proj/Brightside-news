export type NewsUser = {
  id: string
  piUserId: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export type SavedStory = {
  id: string
  userId: string
  storyId: string
  title: string
  summary: string | null
  imageUrl: string | null
  source: string | null
  url: string | null
  publishedAt: string | null
  category: string | null
  savedAt: string
}

export type DonationStatus = "pending" | "approved" | "completed" | "cancelled" | "failed"

export type DonationRecord = {
  id: string
  paymentId: string
  txid: string | null
  piUserId: string | null
  username: string | null
  amount: number
  currency: "PI"
  memo: string
  metadata: Record<string, unknown> | null
  status: DonationStatus
  createdAt: string
  updatedAt: string
}

export type UpsertUserInput = {
  piUserId: string
  username?: string | null
  displayName?: string | null
  avatarUrl?: string | null
}

export type SaveStoryInput = {
  storyId: string
  title: string
  summary?: string | null
  imageUrl?: string | null
  source?: string | null
  url?: string | null
  publishedAt?: string | null
  category?: string | null
}

export type UpsertDonationInput = {
  paymentId: string
  txid?: string | null
  piUserId?: string | null
  username?: string | null
  amount: number
  memo: string
  metadata?: Record<string, unknown> | null
  status: DonationStatus
}
