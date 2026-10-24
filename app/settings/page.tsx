"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import LangSwitch from "@/components/LangSwitch";
import { useLang, type TextSize } from "@/components/LanguageProvider";
import { SHELL } from "@/lib/text/shell";

const card = "space-y-3 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm";

export default function SettingsPage() {
  const router = useRouter();
  const { lang, size, setSize } = useLang();
  const s = SHELL[lang];

  const [voice, setVoice] = useState(true);
  const [owner, setOwner] = useState("");
  const [shop, setShop] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const showDemo = process.env.NODE_ENV !== "production";

  useEffect(() => {
    setVoice(localStorage.getItem("voice") !== "off");
    const u = localStorage.getItem("user");
    if (u) {
      const parsed = JSON.parse(u);
      setOwner(parsed.name || "");
      setShop(parsed.shopName || "");
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function toggleVoice(on: boolean) {
    setVoice(on);
    localStorage.setItem("voice", on ? "on" : "off");
  }

  async function loadDemo() {
    setBusy(true);
    const res = await fetch("/api/dev/seed", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setBusy(false);
    setConfirm(false);
    setToast(res.ok ? `✅ ${s.demoDone}` : s.errGeneric);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const sizes: { key: TextSize; label: string; cls: string }[] = [
    { key: "normal", label: s.sizeNormal, cls: "text-base" },
    { key: "large", label: s.sizeLarge, cls: "text-lg" },
    { key: "xl", label: s.sizeXL, cls: "text-xl" },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-dark">⚙️ {s.settingsTitle}</h1>
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
          {s.back}
        </Link>
      </div>

      <div className={card}>
        <p className="font-bold">👤 {s.account}</p>
        <p className="text-gray-600">{owner}{owner && shop ? " · " : ""}{shop}</p>
      </div>

      <div className={card}>
        <p className="font-bold">🌐 {s.langTitle}</p>
        <LangSwitch />
      </div>

      <div className={card}>
        <p className="font-bold">🔠 {s.textSize}</p>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((z) => (
            <button
              key={z.key}
              onClick={() => setSize(z.key)}
              className={`rounded-2xl p-3 font-semibold ${z.cls} ${size === z.key ? "bg-leaf text-white" : "bg-gray-100"}`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div className={card}>
        <p className="font-bold">🔊 {s.voiceTitle}</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => toggleVoice(true)} className={`rounded-2xl p-3 font-semibold ${voice ? "bg-leaf text-white" : "bg-gray-100"}`}>
            {s.voiceOn}
          </button>
          <button onClick={() => toggleVoice(false)} className={`rounded-2xl p-3 font-semibold ${!voice ? "bg-leaf text-white" : "bg-gray-100"}`}>
            {s.voiceOff}
          </button>
        </div>
      </div>

      <Link href="/feedback" className="block rounded-3xl border border-amber-100 bg-white p-5 font-bold shadow-sm">
        🛟 {s.reportIssue} →
      </Link>

      {showDemo && (
        <div className={card}>
          <p className="font-bold">🧪 {s.demoTitle}</p>
          <p className="text-sm text-gray-500">{s.demoText}</p>
          <button onClick={() => setConfirm(true)} className="w-full rounded-2xl bg-amber-100 p-3 font-bold text-amber-900 active:scale-95">
            {s.demoBtn}
          </button>
        </div>
      )}

      <div className={card}>
        <p className="font-bold">ℹ️ {s.aboutTitle}</p>
        <p className="text-sm text-gray-500">{s.version}</p>
      </div>

      <button onClick={logout} className="w-full rounded-2xl bg-red-50 p-4 text-lg font-bold text-red-600 active:scale-95">
        🚪 {s.logout}
      </button>

      <Modal open={confirm} onClose={() => setConfirm(false)} title={s.demoTitle}>
        <div className="space-y-4">
          <p className="text-lg">{s.demoConfirm}</p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setConfirm(false)} className="rounded-2xl bg-gray-100 p-4 font-bold">{s.demoNo}</button>
            <button onClick={loadDemo} disabled={busy} className="rounded-2xl bg-leaf p-4 font-bold text-white disabled:opacity-60">
              {busy ? "..." : s.demoYes}
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-leaf-dark px-6 py-3 font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}