"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Heart, Loader2, CheckCircle2, AlertCircle, Coins, Smartphone, Code, Globe, Zap } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { PI_DONATION_MIN, PI_DONATION_PRESETS, formatPiAmount, getDonationImpactMessage } from "@/lib/donation-settings"

interface PiPaymentData {
  amount: number
  memo: string
  metadata: Record<string, unknown>
}

interface PiPaymentReference {
  identifier?: string
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void | Promise<void>
  onReadyForServerCompletion: (paymentId: string, txid: string) => void | Promise<void>
  onCancel: (paymentId: string) => void | Promise<void>
  onError: (error: unknown, payment?: PiPaymentReference) => void | Promise<void>
}

interface PiWithPayments {
  createPayment: (paymentData: PiPaymentData, callbacks: PiPaymentCallbacks) => Promise<void>
}

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

function normalizePiUserId(value: unknown): string | null {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^pi-[^\s]+$/i.test(trimmed)) {
    return trimmed.replace(/^pi-/i, "")
  }
  return trimmed
}

function getPiUserId(user: unknown): string | null {
  if (!user || typeof user !== "object") return null

  const authUser = user as Record<string, unknown>

  return (
    normalizePiUserId(authUser.piUserId) ||
    normalizePiUserId(authUser.uid) ||
    normalizePiUserId(authUser.userId) ||
    normalizePiUserId(authUser.id)
  )
}

function getPiUsername(user: unknown): string | null {
  if (!user || typeof user !== "object") return null

  const authUser = user as Record<string, unknown>
  const candidate = authUser.piUsername || authUser.username || authUser.name || authUser.displayName

  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : null
}

function getPiPaymentApi(): PiWithPayments | null {
  const pi = window.Pi as unknown

  if (!pi || typeof pi !== "object") {
    return null
  }

  const paymentPi = pi as Partial<PiWithPayments>

  if (typeof paymentPi.createPayment !== "function") {
    return null
  }

  return paymentPi as PiWithPayments
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { user, isAuthenticated, isPiUser } = useAuth()
  const { isAuthenticated: isPiAuthenticated, reinitialize } = usePiAuth()

  const [selectedAmount, setSelectedAmount] = useState<number | null>(1)
  const [customAmount, setCustomAmount] = useState("")
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "cancelled" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState("")

  const piUserId = useMemo(() => getPiUserId(user), [user])
  const username = useMemo(() => getPiUsername(user), [user])

  const amount = selectedAmount ?? (customAmount ? Number.parseFloat(customAmount) : 0)
  const isValidAmount = Number.isFinite(amount) && amount >= PI_DONATION_MIN

  const resetAndClose = () => {
    setStatus("idle")
    setStatusMessage("")
    setSelectedAmount(1)
    setCustomAmount("")
    onClose()
  }

  const persistStatus = async (
    paymentId: string,
    endpoint: "approve" | "complete" | "cancel",
    body: Record<string, unknown>
  ) => {
    const response = await fetch(`/api/donations/${paymentId}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(data?.error || `Failed to ${endpoint} donation`)
    }

    return data
  }

  const handleDonate = async () => {
    if (!isAuthenticated || !isPiUser || !isPiAuthenticated || !piUserId || !username) {
      setStatus("error")
      setStatusMessage("Please sign in with Pi in Pi Browser before donating.")
      return
    }

    let piPaymentApi = getPiPaymentApi()

    if (!piPaymentApi) {
      try {
        await reinitialize()
      } catch {
        // handled below
      }
    }

    piPaymentApi = getPiPaymentApi()

    if (!piPaymentApi) {
      setStatus("error")
      setStatusMessage("Pi payment is only available inside Pi Browser with an active Pi session.")
      return
    }

    if (!isValidAmount) {
      setStatus("error")
      setStatusMessage(`Please enter at least ${formatPiAmount(PI_DONATION_MIN)}.`)
      return
    }

    setStatus("processing")
    setStatusMessage(`Opening Pi wallet for ${formatPiAmount(amount)}...`)

    const memo = `BrightSide News donation - ${formatPiAmount(amount)}`
    const metadata = {
      type: "donation",
      source: "brightside-news",
      piUserId,
      username,
    }

    try {
      await piPaymentApi.createPayment(
        {
          amount,
          memo,
          metadata,
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            await persistStatus(paymentId, "approve", {
              amount,
              memo,
              metadata,
              piUserId,
              username,
            })
            setStatusMessage("Payment approved. Waiting for Pi completion...")
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            await persistStatus(paymentId, "complete", {
              amount,
              memo,
              metadata,
              piUserId,
              username,
              txid,
            })
            setStatus("success")
            setStatusMessage(`Thank you for donating ${formatPiAmount(amount)} to BrightSide News.`)
          },
          onCancel: async (paymentId: string) => {
            await persistStatus(paymentId, "cancel", {
              amount,
              memo,
              metadata,
              piUserId,
              username,
            })
            setStatus("cancelled")
            setStatusMessage("Donation was cancelled.")
          },
          onError: async (error: unknown, payment?: PiPaymentReference) => {
            const paymentId = payment?.identifier

            if (paymentId) {
              try {
                await persistStatus(paymentId, "cancel", {
                  amount,
                  memo,
                  metadata,
                  piUserId,
                  username,
                  error: error instanceof Error ? error.message : "Pi payment error",
                })
              } catch {
                // ignore secondary failure
              }
            }

            setStatus("error")
            setStatusMessage(error instanceof Error ? error.message : "Pi payment failed.")
          },
        }
      )
    } catch (error: unknown) {
      setStatus("error")
      setStatusMessage(error instanceof Error ? error.message : "Could not start Pi payment.")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0" onClick={resetAndClose}>
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Support BrightSide News with Pi</CardTitle>
            <p className="text-gray-600 mt-2">Donate directly from your Pi wallet to support development.</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-lg border border-sky-200">
            <h4 className="font-semibold text-sky-800 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Your Pi donation supports app development
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-sky-700">
                <Smartphone className="w-4 h-4" />
                <span>New features and UX improvements</span>
              </div>
              <div className="flex items-center gap-2 text-sky-700">
                <Globe className="w-4 h-4" />
                <span>Global reach and content expansion</span>
              </div>
              <div className="flex items-center gap-2 text-sky-700">
                <Zap className="w-4 h-4" />
                <span>Platform reliability and launch support</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold mb-3 block">Choose amount in Pi</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {PI_DONATION_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  variant={selectedAmount === preset ? "default" : "outline"}
                  className={`h-16 flex flex-col ${selectedAmount === preset ? "bg-sky-600 hover:bg-sky-700" : ""}`}
                  onClick={() => {
                    setSelectedAmount(preset)
                    setCustomAmount("")
                  }}
                >
                  <span className="text-lg font-bold">{preset} π</span>
                  <span className="text-xs opacity-80">Quick donate</span>
                </Button>
              ))}
            </div>

            <div>
              <Label htmlFor="custom-amount">Custom amount (π)</Label>
              <Input
                id="custom-amount"
                type="number"
                min={PI_DONATION_MIN}
                step="0.1"
                placeholder="Enter custom Pi amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="mt-1"
              />
            </div>

            {isValidAmount && (
              <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-sm text-sky-800">
                  <strong>You are donating:</strong> {formatPiAmount(amount)}
                </p>
                <p className="text-sm text-sky-700 mt-1">{getDonationImpactMessage(amount)}</p>
              </div>
            )}
          </div>

          <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                π
              </div>
              <div>
                <p className="font-semibold text-purple-800">Pi wallet payment</p>
                <p className="text-sm text-purple-700">You must be signed in with Pi inside Pi Browser to complete this donation.</p>
              </div>
            </div>
          </div>

          {status !== "idle" && (
            <div
              className={`p-4 rounded-lg border ${
                status === "success"
                  ? "border-green-200 bg-green-50 text-green-800"
                  : status === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : status === "cancelled"
                      ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                      : "border-sky-200 bg-sky-50 text-sky-800"
              }`}
            >
              <div className="flex items-start gap-2">
                {status === "success" ? (
                  <CheckCircle2 className="w-5 h-5 mt-0.5" />
                ) : status === "error" ? (
                  <AlertCircle className="w-5 h-5 mt-0.5" />
                ) : status === "processing" ? (
                  <Loader2 className="w-5 h-5 mt-0.5 animate-spin" />
                ) : (
                  <Coins className="w-5 h-5 mt-0.5" />
                )}
                <p className="text-sm font-medium">{statusMessage}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleDonate}
              disabled={!isValidAmount || status === "processing"}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {status === "processing" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Donate with Pi
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetAndClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}