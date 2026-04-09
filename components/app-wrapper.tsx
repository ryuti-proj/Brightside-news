"use client";

import type { ReactNode } from "react";
import { PiAuthProvider } from "@/contexts/pi-auth-context";
import { AuthProvider } from "@/contexts/auth-context";

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AuthProvider>{children}</AuthProvider>
    </PiAuthProvider>
  );
}

export default AppWrapper;