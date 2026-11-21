"use client";

import React, { createContext, useContext, useState } from "react";
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

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<AppLocale>("en");
  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: UI_STRINGS[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  return useContext(LocaleContext);
}
