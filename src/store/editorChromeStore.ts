"use client";

import { create } from "zustand";

type EditorChromeState = {
  active: boolean;
  saving: boolean;
  publishing: boolean;
  saveDraft: (() => void) | null;
  publish: (() => void) | null;
  register: (actions: {
    saveDraft: () => void;
    publish: () => void;
  }) => void;
  setBusy: (busy: { saving?: boolean; publishing?: boolean }) => void;
  clear: () => void;
};

export const useEditorChromeStore = create<EditorChromeState>((set) => ({
  active: false,
  saving: false,
  publishing: false,
  saveDraft: null,
  publish: null,
  register: ({ saveDraft, publish }) =>
    set({
      active: true,
      saveDraft,
      publish,
    }),
  setBusy: (busy) =>
    set((s) => ({
      saving: busy.saving ?? s.saving,
      publishing: busy.publishing ?? s.publishing,
    })),
  clear: () =>
    set({
      active: false,
      saving: false,
      publishing: false,
      saveDraft: null,
      publish: null,
    }),
}));
