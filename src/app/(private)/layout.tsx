"use client";

import { SessionGate } from "@/components/SessionGate/SessionGate";
import type { ReactNode } from "react";

export default function PrivateLayout({ children }: { children: ReactNode }) {
  return <SessionGate>{children}</SessionGate>;
}
