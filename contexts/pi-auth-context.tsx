"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";

export type LoginDTO = {
  id: string;
  username: string;
  credits_balance: number;
  terms_accepted: boolean;
};

interface PiAuthResult {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
}

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
      authenticate: (
        scopes: string[],
        paymentCallback?: (payment: any) => Promise<void>
      ) => Promise<PiAuthResult>;
    };
  }
}

const COMMUNICATION_REQUEST_TYPE =
  "@pi:app:sdk:communication_information_request";
const DEFAULT_ERROR_MESSAGE =
  "Failed to authenticate or login. Please refresh and try again.";

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.name === "SecurityError" ||
        error.code === DOMException.SECURITY_ERR ||
        error.code === 18)
    ) {
      return true;
    }

    if (error instanceof Error && /Permission denied/i.test(error.message)) {
      return true;
    }

    throw error;
  }
}

function parseJsonSafely(value: any): any {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }
  return typeof value === "object" && value !== null ? value : null;
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  hasError: boolean;
  piAccessToken: string | null;
  userData: LoginDTO | null;
  error: string | null;
  isLoading: boolean;
  reinitialize: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && typeof window.Pi !== "undefined") {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      `script[src="${PI_NETWORK_CONFIG.SDK_URL}"]`
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load Pi SDK script")),
        { once: true }
      );
      return;
    }

    if (!PI_NETWORK_CONFIG.SDK_URL) {
      reject(new Error("SDK URL is not set"));
      return;
    }

    const script = document.createElement("script");
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Pi SDK script"));

    document.head.appendChild(script);
  });
};

function requestParentCredentials(): Promise<{
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
} | null> {
  if (!isInIframe()) {
    return Promise.resolve(null);
  }

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const timeoutMs = 1500;

  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = (listener: (event: MessageEvent) => void) => {
      window.removeEventListener("message", listener);
      if (timeoutId !== null) clearTimeout(timeoutId);
    };

    const messageListener = (event: MessageEvent) => {
      if (event.source !== window.parent) return;

      const data = parseJsonSafely(event.data);
      if (!data || data.type !== COMMUNICATION_REQUEST_TYPE || data.id !== requestId) {
        return;
      }

      cleanup(messageListener);

      const payload =
        typeof data.payload === "object" && data.payload !== null
          ? data.payload
          : {};

      const accessToken =
        typeof payload.accessToken === "string" ? payload.accessToken : null;

      const user =
        typeof payload.user === "object" &&
        payload.user !== null &&
        typeof payload.user.uid === "string" &&
        typeof payload.user.username === "string"
          ? {
              uid: payload.user.uid,
              username: payload.user.username,
            }
          : null;

      resolve(accessToken && user ? { accessToken, user } : null);
    };

    timeoutId = setTimeout(() => {
      cleanup(messageListener);
      resolve(null);
    }, timeoutMs);

    window.addEventListener("message", messageListener);

    window.parent.postMessage(
      JSON.stringify({
        type: COMMUNICATION_REQUEST_TYPE,
        id: requestId,
      }),
      "*"
    );
  });
}

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Pi login available");
  const [hasError, setHasError] = useState(false);
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<LoginDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const authInFlightRef = useRef(false);

  const finalizePiLogin = async (
    accessToken: string,
    user: { uid: string; username: string }
  ): Promise<void> => {
    setAuthMessage("Logging in...");

    setPiAccessToken(accessToken);
    setUserData({
      id: user.uid,
      username: user.username,
      credits_balance: 0,
      terms_accepted: true,
    });
  };

  const getErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) {
      return "An unexpected error occurred. Please try again.";
    }

    const errorMessage = error.message;

    if (
      errorMessage.includes("SDK failed to load") ||
      errorMessage.includes("load Pi SDK")
    ) {
      return "Failed to load Pi Network SDK. Please check your internet connection.";
    }

    if (errorMessage.includes("authenticate")) {
      return "Pi Network authentication failed. Please try again.";
    }

    return `Authentication error: ${errorMessage}`;
  };

  const authenticateViaPiSdk = async (): Promise<void> => {
    setAuthMessage("Initializing Pi Network...");
    await window.Pi.init({
      version: "2.0",
      sandbox: PI_NETWORK_CONFIG.SANDBOX,
    });

    setAuthMessage("Authenticating with Pi Network...");
    const piAuthResult = await window.Pi.authenticate(["username", "payments"]);

    if (!piAuthResult.accessToken) {
      throw new Error(DEFAULT_ERROR_MESSAGE);
    }

    await finalizePiLogin(piAuthResult.accessToken, piAuthResult.user);
  };

  const initializePiAndAuthenticate = async () => {
    if (authInFlightRef.current) return;

    authInFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    setHasError(false);

    try {
      const parentCredentials = await requestParentCredentials();

      if (parentCredentials) {
        await finalizePiLogin(
          parentCredentials.accessToken,
          parentCredentials.user
        );
      } else {
        setAuthMessage("Loading Pi Network SDK...");

        if (typeof window.Pi === "undefined") {
          await loadPiSDK();
        }

        if (typeof window.Pi === "undefined") {
          throw new Error("SDK failed to load: Pi object not available after script load");
        }

        await authenticateViaPiSdk();
      }

      setIsAuthenticated(true);
      setHasError(false);
      setAuthMessage("Pi login successful");
    } catch (err) {
      console.error("❌ Pi Network initialization failed:", err);
      setHasError(true);
      const errorMessage = getErrorMessage(err);
      setAuthMessage(errorMessage);
      setError(errorMessage);
      setIsAuthenticated(false);
      setPiAccessToken(null);
      setUserData(null);
    } finally {
      setIsLoading(false);
      authInFlightRef.current = false;
    }
  };

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    hasError,
    piAccessToken,
    userData,
    error,
    isLoading,
    reinitialize: initializePiAndAuthenticate,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}