"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { FileText, Users, TrendingUp, DollarSign } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}

function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-green-600">{change}</p>
          </div>
          <div className={`w-8 h-8 ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboardStats() {
  const stats = [
    {
      title: "Total Stories",
      value: "156",
      change: "+12 this week",
      icon: <FileText className="w-8 h-8" />,
      color: "text-blue-500",
    },
    {
      title: "Active Users",
      value: "12,847",
      change: "+234 this week",
      icon: <Users className="w-8 h-8" />,
      color: "text-green-500",
    },
    {
      title: "Total Donations",
      value: "$2,450",
      change: "+$180 this week",
      icon: <DollarSign className="w-8 h-8" />,
      color: "text-purple-500",
    },
    {
      title: "Page Views",
      value: "89,234",
      change: "+5,678 this week",
      icon: <TrendingUp className="w-8 h-8" />,
      color: "text-red-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}
