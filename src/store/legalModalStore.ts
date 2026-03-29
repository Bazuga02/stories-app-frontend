"use client";

import { create } from "zustand";
import type { LegalDoc } from "@/components/legal/LegalDocumentModals";

type LegalModalState = {
  open: LegalDoc;
  showPrivacy: () => void;
  showTerms: () => void;
  close: () => void;
};

export const useLegalModalStore = create<LegalModalState>((set) => ({
  open: null,
  showPrivacy: () => set({ open: "privacy" }),
  showTerms: () => set({ open: "terms" }),
  close: () => set({ open: null }),
}));
