"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  X,
  Heart,
  DollarSign,
  CreditCard,
  Globe,
  Mail,
  ExternalLink,
  Copy,
  CheckCircle,
  Code,
  Smartphone,
  Zap,
} from "lucide-react"

interface DonationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [donorName, setDonorName] = useState("")
  const [donorMessage, setDonorMessage] = useState("")
  const [copiedField, setCopiedField] = useState("")

  const predefinedAmounts = [10, 25, 50, 100]

  const donationMethods = [
    {
      id: "paypal",
      name: "PayPal",
      icon: <DollarSign className="w-5 h-5" />,
      address: "donations@brightsidenews.com",
      description: "Secure PayPal donation",
      color: "bg-blue-500",
    },
    {
      id: "stripe",
      name: "Credit Card",
      icon: <CreditCard className="w-5 h-5" />,
      address: "https://donate.stripe.com/brightside",
      description: "Secure credit card payment",
      color: "bg-purple-500",
    },
    {
      id: "pi",
      name: "Pi Network",
      icon: (
        <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
          π
        </div>
      ),
      address: "@brightsidenews",
      description: "Pi cryptocurrency donation",
      color: "bg-purple-600",
    },
  ]

  const impactMessages = {
    10: "Helps fund app development for one day",
    25: "Supports new feature development for a week",
    50: "Funds server costs and global expansion for a month",
    100: "Enables major app improvements and new language support",
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(""), 2000)
  }

  const getSelectedAmountValue = () => {
    return selectedAmount || (customAmount ? Number.parseFloat(customAmount) : 0)
  }

  const handleDonate = () => {
    const amount = getSelectedAmountValue()
    if (!amount || !selectedMethod) return

    const method = donationMethods.find((m) => m.id === selectedMethod)
    if (!method) return

    // For external links (like Stripe), open in new tab
    if (method.address.startsWith("http")) {
      window.open(method.address, "_blank")
    } else {
      // For crypto addresses, copy to clipboard
      copyToClipboard(method.address, selectedMethod)
      alert(`${method.name} address copied to clipboard! Amount: $${amount}`)
    }

    // Reset form
    setSelectedAmount(null)
    setCustomAmount("")
    setSelectedMethod(null)
    setDonorName("")
    setDonorMessage("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="relative">
          <Button variant="ghost" size="sm" className="absolute right-0 top-0" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Support BrightSide News Development</CardTitle>
            <p className="text-gray-600 mt-2">
              Help us continue developing this app and bringing positive news to the world
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Development Impact Section */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-lg border border-sky-200">
            <h4 className="font-semibold text-sky-800 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Your Donation Supports App Development
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 text-sky-700">
                <Smartphone className="w-4 h-4" />
                <span>New Features & UI Improvements</span>
              </div>
              <div className="flex items-center gap-2 text-sky-700">
                <Globe className="w-4 h-4" />
                <span>Global News Sources & Languages</span>
              </div>
              <div className="flex items-center gap-2 text-sky-700">
                <Zap className="w-4 h-4" />
                <span>Server Costs & Performance</span>
              </div>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Choose Amount</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {predefinedAmounts.map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={`h-16 flex flex-col ${selectedAmount === amount ? "bg-sky-600 hover:bg-sky-700" : ""}`}
                  onClick={() => {
                    setSelectedAmount(amount)
                    setCustomAmount("")
                  }}
                >
                  <span className="text-lg font-bold">${amount}</span>
                  <span className="text-xs opacity-80">{impactMessages[amount as keyof typeof impactMessages]}</span>
                </Button>
              ))}
            </div>

            <div>
              <Label htmlFor="custom-amount">Custom Amount ($)</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value)
                  setSelectedAmount(null)
                }}
                className="mt-1"
              />
            </div>

            {getSelectedAmountValue() > 0 && (
              <div className="mt-3 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                <p className="text-sm text-sky-800">
                  <strong>Development Impact:</strong>{" "}
                  {impactMessages[getSelectedAmountValue() as keyof typeof impactMessages] ||
                    "Your generous donation helps us continue developing BrightSide News and expanding our positive impact worldwide!"}
                </p>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
            <div className="grid grid-cols-1 gap-3">
              {donationMethods.map((method) => (
                <Card
                  key={method.id}
                  className={`cursor-pointer transition-all ${
                    selectedMethod === method.id ? "ring-2 ring-sky-500 bg-sky-50" : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 ${method.color} rounded-lg flex items-center justify-center text-white`}
                      >
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{method.name}</h4>
                        <p className="text-xs text-gray-500">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && <CheckCircle className="w-5 h-5 text-sky-600" />}
                    </div>

                    {selectedMethod === method.id && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-gray-100 p-2 rounded font-mono">{method.address}</code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(method.address, method.id)
                            }}
                          >
                            {copiedField === method.id ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                        {method.address.startsWith("http") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 w-full"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(method.address, "_blank")
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Open Payment Page
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Optional Donor Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Optional Information</Label>
            <div>
              <Label htmlFor="donor-name">Your Name (for recognition)</Label>
              <Input
                id="donor-name"
                placeholder="Enter your name (optional)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="donor-message">Message</Label>
              <Textarea
                id="donor-message"
                placeholder="Leave a message of support for the development team (optional)"
                value={donorMessage}
                onChange={(e) => setDonorMessage(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Donate Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={handleDonate}
              disabled={!getSelectedAmountValue() || !selectedMethod}
              className="w-full bg-sky-600 hover:bg-sky-700 h-12 text-lg"
            >
              <Heart className="w-5 h-5 mr-2" />
              Support Development - ${getSelectedAmountValue() || 0}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Your donation directly supports BrightSide News app development and global expansion
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Questions about donations or development?</span>
            </div>
            <p className="text-sm text-gray-600">
              Contact us at{" "}
              <a href="mailto:donations@brightsidenews.com" className="text-sky-600 hover:underline">
                donations@brightsidenews.com
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              BrightSide News is committed to transparency. All donations go directly toward app development, new
              features, server costs, and expanding our positive news coverage worldwide.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
