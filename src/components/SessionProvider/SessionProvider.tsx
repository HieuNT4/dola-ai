"use client";

import { apiSend, ApiError, setUnauthorizedHandler } from "@/lib/client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type SessionContextValue = {
  ready: boolean;
  email: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    setUnauthorizedHandler(() => setEmail(null));
  }, []);

  useEffect(() => {
    let active = true;
    apiSend<{ email: string | null }>("/api/session")
      .then((payload) => {
        if (active) setEmail(payload.email);
      })
      .catch(() => {
        if (active) setEmail(null);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(async (nextEmail: string, password: string) => {
    const payload = await apiSend<{ email: string }>("/api/session", {
      method: "POST",
      body: JSON.stringify({ email: nextEmail, password }),
    });
    setEmail(payload.email);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await apiSend("/api/session", { method: "DELETE" });
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
    }
    setEmail(null);
  }, []);

  const value = useMemo(() => ({ ready, email, signIn, signOut }), [ready, email, signIn, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Session is missing");
  return value;
}
