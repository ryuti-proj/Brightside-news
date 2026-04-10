"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, Heart, Calendar, Coins, UserRound } from "lucide-react"
import type { DonationRecord } from "@/types/user-data"
import { formatPiAmount, getDonationStatusTone } from "@/lib/donation-settings"

export function AdminDonations() {
  const [records, setRecords] = useState<DonationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const loadRecords = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/donations", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load donations")
      }

      setRecords(Array.isArray(data?.records) ? data.records : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load donations")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRecords()
  }, [])

  const completedTotal = useMemo(
    () => records.filter((record) => record.status === "completed").reduce((sum, record) => sum + record.amount, 0),
    [records]
  )

  const pendingTotal = useMemo(
    () => records.filter((record) => record.status === "pending" || record.status === "approved").length,
    [records]
  )

  const completedCount = useMemo(
    () => records.filter((record) => record.status === "completed").length,
    [records]
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pi Donations</h2>
          <p className="text-gray-600">Live Pi donation records captured from the app payment flow.</p>
        </div>
        <Button variant="outline" onClick={() => void loadRecords()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Pi</p>
                <p className="text-2xl font-bold">{formatPiAmount(completedTotal)}</p>
              </div>
              <Coins className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Donations</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
              <Heart className="w-8 h-8 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending / Approved</p>
                <p className="text-2xl font-bold">{pendingTotal}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Donation Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">{error}</div>}

          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading Pi donations...</p>
          ) : records.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No Pi donations recorded yet</p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div key={record.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900">{formatPiAmount(record.amount)}</p>
                        <Badge variant={getDonationStatusTone(record.status)}>{record.status}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 break-all">Payment ID: {record.paymentId}</p>
                      <p className="text-sm text-gray-600 break-all">TXID: {record.txid || "—"}</p>
                      <p className="text-sm text-gray-600">Memo: {record.memo}</p>
                    </div>

                    <div className="space-y-1 text-sm text-gray-600 lg:text-right">
                      <div className="flex items-center gap-2 lg:justify-end">
                        <UserRound className="w-4 h-4" />
                        <span>{record.username || "Unknown user"}</span>
                      </div>
                      <p>Pi User ID: {record.piUserId || "—"}</p>
                      <p>{new Date(record.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
