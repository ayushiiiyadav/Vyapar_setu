"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { isLang, type LangCode } from "@/lib/languages";
import { T, type TKey } from "@/lib/i18n";

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: TKey) => string;
};

const LangContext = createContext<Ctx>({
  lang: "hi",
  setLang: () => {},
  t: (key) => T.hi[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("hi");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (isLang(saved)) setLangState(saved);
  }, []);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const t = useCallback((key: TKey) => T[lang][key], [lang]);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);