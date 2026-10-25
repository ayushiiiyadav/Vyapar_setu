"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { SHELL } from "@/lib/text/shell";
import type { LangCode } from "@/lib/languages";

type Issue = {
  _id: string;
  type: "bug" | "idea" | "other";
  message: string;
  status: "open" | "seen" | "fixed";
  createdAt: string;
};

const BCP: Record<LangCode, string> = { hi: "hi-IN", en: "en-IN", mr: "mr-IN", te: "te-IN" };
const ICON = { bug: "🐞", idea: "💡", other: "💬" };

export default function FeedbackPage() {
  const router = useRouter();
  const { lang } = useLang();
  const s = SHELL[lang];

  const [type, setType] = useState<Issue["type"]>("bug");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  const api = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return null;
      }
      const res = await fetch(url, {
        ...options,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        router.push("/login");
        return null;
      }
      return res;
    },
    [router]
  );

  const load = useCallback(async () => {
    const res = await api("/api/issues");
    if (res?.ok) setIssues((await res.json()).issues);
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit() {
    setNote(null);
    setSending(true);
    const res = await api("/api/issues", { method: "POST", body: JSON.stringify({ type, message }) });
    setSending(false);
    if (!res) return;
    if (res.ok) {
      setMessage("");
      setNote({ ok: true, text: s.thanks });
      load();
    } else {
      setNote({ ok: false, text: res.status === 400 ? s.errShort : res.status === 429 ? s.errMany : s.errGeneric });
    }
  }

  const types: { key: Issue["type"]; label: string }[] = [
    { key: "bug", label: s.typeBug },
    { key: "idea", label: s.typeIdea },
    { key: "other", label: s.typeOther },
  ];
  const statusText = { open: s.stOpen, seen: s.stSeen, fixed: s.stFixed };
  const statusCls = {
    open: "bg-amber-100 text-amber-800",
    seen: "bg-sky-100 text-sky-800",
    fixed: "bg-emerald-100 text-emerald-800",
  };

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-dark">🛟 {s.issueTitle}</h1>
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
          {s.back}
        </Link>
      </div>

      <p className="text-gray-600">{s.issueIntro}</p>

      <div className="space-y-3 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setType(t.key)}
              className={`rounded-2xl p-3 font-semibold ${type === t.key ? "bg-leaf text-white" : "bg-gray-100"}`}
            >
              {ICON[t.key]} {t.label}
            </button>
          ))}
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={s.msgPh}
          rows={5}
          maxLength={1000}
          className="w-full rounded-2xl border-2 border-gray-200 p-4 text-lg outline-none focus:border-leaf"
        />
        {note && (
          <p className={`rounded-xl p-3 font-semibold ${note.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-600"}`}>
            {note.text}
          </p>
        )}
        <button
          onClick={submit}
          disabled={sending}
          className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white active:scale-95 disabled:opacity-60"
        >
          {sending ? s.sending : `📨 ${s.send}`}
        </button>
      </div>

      <div className="space-y-3">
        <p className="font-bold">{s.mineTitle}</p>
        {issues.length === 0 && <p className="text-gray-500">{s.none}</p>}
        {issues.map((i) => (
          <div key={i._id} className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {ICON[i.type]} {new Date(i.createdAt).toLocaleDateString(BCP[lang], { day: "numeric", month: "short" })}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusCls[i.status]}`}>{statusText[i.status]}</span>
            </div>
            <p className="whitespace-pre-wrap break-words">{i.message}</p>
          </div>
        ))}
      </div>
    </main>
  );
}