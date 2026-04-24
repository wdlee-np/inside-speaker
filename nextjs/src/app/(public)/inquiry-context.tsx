"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Speaker } from "@/lib/database.types";

interface InquiryState {
  open: boolean;
  speaker: Speaker | null;
}

interface InquiryContextValue {
  state: InquiryState;
  openInquiry: (speaker?: Speaker) => void;
  closeInquiry: () => void;
}

const InquiryContext = createContext<InquiryContextValue | null>(null);

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InquiryState>({ open: false, speaker: null });

  const openInquiry = useCallback((speaker?: Speaker) => {
    setState({ open: true, speaker: speaker ?? null });
  }, []);

  const closeInquiry = useCallback(() => {
    setState({ open: false, speaker: null });
  }, []);

  return (
    <InquiryContext.Provider value={{ state, openInquiry, closeInquiry }}>
      {children}
    </InquiryContext.Provider>
  );
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) throw new Error("useInquiry must be used within InquiryProvider");
  return ctx;
}
