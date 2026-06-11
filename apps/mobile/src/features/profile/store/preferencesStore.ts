import { create } from "zustand";
import type { Locale } from "@/lib/i18n";

interface PreferencesState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  locale: "fr",
  setLocale: (locale) => {
    if (locale === "fr") set({ locale });
  },
}));
