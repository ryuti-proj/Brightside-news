"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { DonationSettings, type DonationMethod, type DonationRecord } from "@/lib/donation-settings"
import { DollarSign, CreditCard, Coins, Plus, Edit, Trash2, Save, TrendingUp, Users, Calendar } from "lucide-react"

export function AdminDonations() {
  const [donationSettings] = useState(() => DonationSettings.getInstance())
  const [methods, setMethods] = useState<DonationMethod[]>([])
  const [records, setRecords] = useState<DonationRecord[]>([])
  const [editingMethod, setEditingMethod] = useState<string | null>(null)
  const [newMethod, setNewMethod] = useState<Partial<DonationMethod>>({})
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    donationSettings.loadFromStorage()
    setMethods(donationSettings.getMethods())
    setRecords(donationSettings.getRecords())
  }, [donationSettings])

  const handleUpdateMethod = (id: string, updates: Partial<DonationMethod>) => {
    donationSettings.updateMethod(id, updates)
    setMethods(donationSettings.getMethods())
    setEditingMethod(null)
  }

  const handleAddMethod = () => {
    if (newMethod.name && newMethod.type && newMethod.address) {
      donationSettings.addMethod({
        name: newMethod.name,
        type: newMethod.type as any,
        address: newMethod.address,
        isActive: newMethod.isActive ?? true,
        description: newMethod.description,
      })
      setMethods(donationSettings.getMethods())
      setNewMethod({})
      setShowAddForm(false)
    }
  }

  const handleRemoveMethod = (id: string) => {
    if (confirm("Are you sure you want to remove this donation method?")) {
      donationSettings.removeMethod(id)
      setMethods(donationSettings.getMethods())
    }
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "paypal":
        return <DollarSign className="w-4 h-4" />
      case "stripe":
        return <CreditCard className="w-4 h-4" />
      case "pi":
        return <Coins className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const totalDonations = records.reduce((sum, record) => (record.status === "completed" ? sum + record.amount : sum), 0)

  const thisMonthDonations = records
    .filter((record) => {
      const recordDate = new Date(record.timestamp)
      const now = new Date()
      return (
        recordDate.getMonth() === now.getMonth() &&
        recordDate.getFullYear() === now.getFullYear() &&
        record.status === "completed"
      )
    })
    .reduce((sum, record) => sum + record.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Donation Management</h2>
        <p className="text-gray-600">Manage donation methods and track contributions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold">${totalDonations.toFixed(2)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">${thisMonthDonations.toFixed(2)}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Methods</p>
                <p className="text-2xl font-bold">{methods.filter((m) => m.isActive).length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Donation Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Donation Methods</CardTitle>
            <Button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Method
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Method Form */}
          {showAddForm && (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium mb-3">Add New Donation Method</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-name">Method Name</Label>
                  <Input
                    id="new-name"
                    value={newMethod.name || ""}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    placeholder="e.g., PayPal"
                  />
                </div>
                <div>
                  <Label htmlFor="new-type">Type</Label>
                  <select
                    id="new-type"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={newMethod.type || ""}
                    onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value as any })}
                  >
                    <option value="">Select type</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                    <option value="pi">Pi Network</option>
                    <option value="crypto">Cryptocurrency</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="new-address">Address/ID</Label>
                  <Input
                    id="new-address"
                    value={newMethod.address || ""}
                    onChange={(e) => setNewMethod({ ...newMethod, address: e.target.value })}
                    placeholder="e.g., donations@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">Description</Label>
                  <Input
                    id="new-description"
                    value={newMethod.description || ""}
                    onChange={(e) => setNewMethod({ ...newMethod, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button onClick={handleAddMethod} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Method
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setNewMethod({})
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Existing Methods */}
          {methods.map((method) => (
            <div key={method.id} className="p-4 border rounded-lg">
              {editingMethod === method.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Method Name</Label>
                      <Input
                        value={method.name}
                        onChange={(e) => handleUpdateMethod(method.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Address/ID</Label>
                      <Input
                        value={method.address}
                        onChange={(e) => handleUpdateMethod(method.id, { address: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={method.description || ""}
                        onChange={(e) => handleUpdateMethod(method.id, { description: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => setEditingMethod(null)} className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingMethod(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getMethodIcon(method.type)}
                    <div>
                      <h4 className="font-medium">{method.name}</h4>
                      <p className="text-sm text-gray-600">{method.address}</p>
                      {method.description && <p className="text-xs text-gray-500">{method.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.isActive}
                      onCheckedChange={(checked) => handleUpdateMethod(method.id, { isActive: checked })}
                    />
                    <Badge variant={method.isActive ? "default" : "secondary"}>
                      {method.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => setEditingMethod(method.id)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMethod(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No donations recorded yet</p>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 10).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">
                      ${record.amount.toFixed(2)} {record.currency}
                    </p>
                    <p className="text-sm text-gray-600">
                      via {record.method} • {new Date(record.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      record.status === "completed"
                        ? "default"
                        : record.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
