import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { UI_STRINGS } from '../data/gaia.js';
import { usePrefsStore } from '../store/prefs.js';

const LangContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: (k) => k,
});

export function LangProvider({ children }) {
  // Language is sourced from the persisted prefs store so the user's choice
  // survives app reloads (matches competitor parity).
  const lang = usePrefsStore((s) => s.lang);
  const setLang = usePrefsStore((s) => s.setLang);

  const t = useCallback(
    (key) => UI_STRINGS[lang]?.[key] ?? UI_STRINGS.en[key] ?? key,
    [lang],
  );

  const toggle = useCallback(() => setLang(lang === 'en' ? 'fr' : 'en'), [lang, setLang]);

  const value = useMemo(() => ({ lang, setLang, t, toggle }), [lang, setLang, t, toggle]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
