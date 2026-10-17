"use client";
import { LANGS, type LangCode } from "@/lib/languages";
import { useLang } from "@/components/LanguageProvider";

export default function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {(Object.keys(LANGS) as LangCode[]).map((c) => (
        <button
          key={c}
          onClick={() => setLang(c)}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            c === lang ? "bg-leaf text-white" : "bg-white text-gray-700 shadow-sm"
          }`}
        >
          {LANGS[c].name}
        </button>
      ))}
    </div>
  );
}