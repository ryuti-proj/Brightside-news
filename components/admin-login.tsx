"use client"

import { AdminAuth } from "./admin-auth"

interface AdminLoginProps {
  onLogin: (success: boolean) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  return <AdminAuth onLogin={onLogin} />
}
