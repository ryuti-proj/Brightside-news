import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "BrightSide Admin - Administration Panel",
  description: "Administration panel for BrightSide News platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
