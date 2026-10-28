"use client";

import { AppShell } from "@/components/AppShell/AppShell";
import { LedgerProvider } from "@/components/LedgerProvider/LedgerProvider";
import { LoadingScreen } from "@/components/LoadingScreen/LoadingScreen";
import { LoginScreen } from "@/components/LoginScreen/LoginScreen";
import { useSession } from "@/components/SessionProvider/SessionProvider";
import type { ReactNode } from "react";

export function SessionGate({ children }: { children: ReactNode }) {
  const session = useSession();
  if (!session.ready) return <LoadingScreen />;
  if (!session.email) return <LoginScreen />;
  return (
    <LedgerProvider>
      <AppShell email={session.email} onSignOut={() => void session.signOut()}>
        {children}
      </AppShell>
    </LedgerProvider>
  );
}
