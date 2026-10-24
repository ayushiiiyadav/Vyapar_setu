"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { isLang, type LangCode } from "@/lib/languages";
import { T, type TKey } from "@/lib/i18n";

export type TextSize = "normal" | "large" | "xl";
const PX: Record<TextSize, string> = { normal: "16px", large: "18px", xl: "20px" };

type Ctx = {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: TKey) => string;
  size: TextSize;
  setSize: (s: TextSize) => void;
};

const LangContext = createContext<Ctx>({
  lang: "hi",
  setLang: () => {},
  t: (key) => T.hi[key],
  size: "normal",
  setSize: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("hi");
  const [size, setSizeState] = useState<TextSize>("normal");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (isLang(savedLang)) setLangState(savedLang);
    const savedSize = localStorage.getItem("size");
    if (savedSize === "normal" || savedSize === "large" || savedSize === "xl") setSizeState(savedSize);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = PX[size];
  }, [size]);

  const setLang = useCallback((l: LangCode) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  }, []);

  const setSize = useCallback((s: TextSize) => {
    setSizeState(s);
    localStorage.setItem("size", s);
  }, []);

  const t = useCallback((key: TKey) => T[lang][key], [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t, size, setSize }}>{children}</LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);