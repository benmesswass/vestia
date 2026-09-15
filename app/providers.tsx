"use client";

import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { VestiaProvider } from "@/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <VestiaProvider>
      <ToastProvider>{children}</ToastProvider>
    </VestiaProvider>
  );
}
