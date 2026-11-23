"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AppLocale, UI_STRINGS, UiStrings } from "@/lib/i18n";

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (l: AppLocale) => void;
  t: UiStrings;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: "en",
  setLocale: () => {},
  t: UI_STRINGS.en,
});

const STORAGE_KEY = "ni_locale";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>("en");

  // Restore the saved choice on mount (localStorage is client-only).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "de" || saved === "fr") setLocaleState(saved);
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }, []);

  const setLocale = (l: AppLocale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
      document.cookie = `${STORAGE_KEY}=${l}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // ignore
    }
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: UI_STRINGS[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
