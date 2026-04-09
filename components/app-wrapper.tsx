"use client";

import type { ReactNode } from "react";
import { PiAuthProvider, usePiAuth } from "@/contexts/pi-auth-context";
import { AuthProvider } from "@/contexts/auth-context";
import { AuthLoadingScreen } from "./auth-loading-screen";

function AppContent({ children }: { children: ReactNode }) {
  const bypassPiAuth = process.env.NEXT_PUBLIC_BYPASS_PI_AUTH === "true";
  const { isAuthenticated, hasError, authMessage } = usePiAuth();

  if (bypassPiAuth) {
    return <>{children}</>;
  }

  if (!isAuthenticated && !hasError) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated && hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-md rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Pi authentication required</h1>
          <p className="text-sm text-gray-600 leading-6">
            BrightSide is configured as a Pi-ready app. We could not complete Pi sign-in for this session.
          </p>
          <p className="mt-4 text-sm text-sky-700 bg-sky-50 rounded-lg p-3">{authMessage}</p>
          <p className="mt-4 text-xs text-gray-500">
            For normal browser testing, set <code>NEXT_PUBLIC_BYPASS_PI_AUTH=true</code> in your environment.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AppWrapper({ children }: { children: ReactNode }) {
  return (
    <PiAuthProvider>
      <AuthProvider>
        <AppContent>{children}</AppContent>
      </AuthProvider>
    </PiAuthProvider>
  );
}
