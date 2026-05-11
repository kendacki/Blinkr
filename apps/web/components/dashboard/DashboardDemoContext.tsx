"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { BlinkRow } from "@/components/dashboard/EmployerSession";
import { generateMockTransactions } from "@/lib/mockBlinkTransactions";

type DashboardDemoValue = {
  mockBlinks: BlinkRow[];
  appendMockTransactions: (count?: number) => void;
};

const DashboardDemoContext = createContext<DashboardDemoValue | null>(null);

export function DashboardDemoProvider({ children }: { children: React.ReactNode }) {
  const [mockBlinks, setMockBlinks] = useState<BlinkRow[]>([]);

  const appendMockTransactions = useCallback((count = 5) => {
    setMockBlinks((prev) => [...prev, ...generateMockTransactions(count)]);
  }, []);

  const value = useMemo(
    () => ({
      mockBlinks,
      appendMockTransactions,
    }),
    [mockBlinks, appendMockTransactions],
  );

  return <DashboardDemoContext.Provider value={value}>{children}</DashboardDemoContext.Provider>;
}

export function useDashboardDemo(): DashboardDemoValue {
  const ctx = useContext(DashboardDemoContext);
  if (!ctx) {
    throw new Error("useDashboardDemo must be used within DashboardDemoProvider");
  }
  return ctx;
}
