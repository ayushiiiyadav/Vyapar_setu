"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useLang } from "@/components/LanguageProvider";
import { LANGS, type LangCode } from "@/lib/languages";
import { SHELL } from "@/lib/text/shell";
import { reportsText } from "@/lib/text/reports";
import { displayName } from "@/lib/catalog";

type Product = {
  _id: string;
  name: string;
  names?: Record<string, string>;
  icon?: string;
  unit: string;
  stock: number;
  lowStockLimit: number;
  expiryDate?: string;
};
type Report = {
  today: { total: number; count: number };
  week: { total: number; count: number };
  daily: { day: string; total: number }[];
  udhaarPending: number;
};
type Alert = { p: Product; kind: "out" | "expired" | "today" | "low" | "soon"; days: number; rank: number };

const BCP: Record<LangCode, string> = { hi: "hi-IN", en: "en-IN", mr: "mr-IN", te: "te-IN" };
const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
const card = "rounded-3xl border border-amber-100 bg-white p-5 shadow-sm";

export default function Dashboard() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const s = SHELL[lang];
  const en = SHELL.en;
  const rt = reportsText[lang];

  const [shop, setShop] = useState("");
  const [dateText, setDateText] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (user) setShop(JSON.parse(user).shopName || "");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([fetch("/api/products", { headers }), fetch("/api/reports", { headers })])
      .then(async ([p, r]) => {
        if (p.status === 401 || r.status === 401) {
          router.push("/login");
          return;
        }
        if (p.ok) setProducts((await p.json()).products);
        if (r.ok) setReport(await r.json());
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    setDateText(new Date().toLocaleDateString(BCP[lang], { weekday: "long", day: "numeric", month: "long" }));
  }, [lang]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const stats = useMemo(() => {
    const total = products.length;
    const out = products.filter((p) => p.stock === 0).length;
    const low = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockLimit).length;
    const expiring = products.filter((p) => p.expiryDate && daysLeft(p.expiryDate) <= 7).length;

    const alerts: Alert[] = [];
    products.forEach((p) => {
      const d = p.expiryDate ? daysLeft(p.expiryDate) : null;
      if (p.stock === 0) alerts.push({ p, kind: "out", days: 0, rank: 0 });
      else if (d !== null && d < 0) alerts.push({ p, kind: "expired", days: d, rank: 1 });
      else if (d === 0) alerts.push({ p, kind: "today", days: 0, rank: 2 });
      else if (p.stock <= p.lowStockLimit) alerts.push({ p, kind: "low", days: d ?? 99, rank: 3 });
      else if (d !== null && d <= 7) alerts.push({ p, kind: "soon", days: d, rank: 4 });
    });
    alerts.sort((a, b) => a.rank - b.rank || a.p.stock - b.p.stock);
    return { total, out, low, expiring, healthy: total - out - low, alerts };
  }, [products]);

  const pct = (n: number) => (stats.total ? `${(n / stats.total) * 100}%` : "0%");
  const chart = (report?.daily ?? []).map((d) => ({ ...d, day: rt.days[d.day] || d.day }));

  const chip = (a: Alert) => {
    switch (a.kind) {
      case "out": return { text: s.stOut, cls: "bg-red-100 text-red-700" };
      case "expired": return { text: s.stExpired, cls: "bg-red-100 text-red-700" };
      case "today": return { text: s.stExpiresToday, cls: "bg-red-100 text-red-700" };
      case "low": return { text: s.stLow, cls: "bg-amber-100 text-amber-800" };
      default: return { text: s.stExpiresIn(a.days), cls: "bg-orange-100 text-orange-700" };
    }
  };

  const head = (main: string, sub: string) => (
    <div className="mb-3">
      <p className="font-bold">{main}</p>
      {lang !== "en" && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );

  const menuItem = "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left font-semibold hover:bg-amber-50";

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-4 pb-28">
      {/* Top bar */}
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-gray-500">{s.hello}</p>
          <h1 className="text-2xl font-bold text-leaf-dark">{shop || "Vyapar Setu"}</h1>
          {dateText && <p className="text-sm text-gray-400">{dateText}</p>}
        </div>
        <button
          onClick={() => setMenu(!menu)}
          aria-label="Menu"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-leaf text-xl font-bold text-white shadow"
        >
          {(shop || "V").charAt(0).toUpperCase()}
        </button>

        {menu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
            <div className="absolute right-0 top-14 z-50 w-64 space-y-1 rounded-3xl bg-white p-3 shadow-2xl">
              <Link href="/settings" className={menuItem}>⚙️ {s.settings}</Link>
              <Link href="/feedback" className={menuItem}>🛟 {s.reportIssue}</Link>
              <div className="px-3 py-2">
                <p className="mb-2 text-sm font-semibold text-gray-500">🌐 {s.language}</p>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(LANGS) as LangCode[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setLang(c)}
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${c === lang ? "bg-leaf text-white" : "bg-gray-100"}`}
                    >
                      {LANGS[c].name}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={logout} className={`${menuItem} text-red-600`}>🚪 {s.logout}</button>
            </div>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-linear-to-br from-leaf to-leaf-dark p-6 text-white shadow-lg">
            <p className="opacity-80">{s.todaySales}</p>
            <p className="text-5xl font-bold">₹{report?.today.total ?? 0}</p>
            <p className="mt-1 text-sm opacity-80">
              {s.bills(report?.today.count ?? 0)}
              {report ? ` · ${s.last7}: ₹${report.week.total}` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/billing" className="rounded-2xl bg-leaf p-4 text-center text-lg font-bold text-white shadow active:scale-95">
              🧾 {s.quickBill}
            </Link>
            <Link href="/products" className="rounded-2xl bg-emerald-100 p-4 text-center text-lg font-bold text-emerald-900 active:scale-95">
              📦 {s.quickStock}
            </Link>
          </div>

          <div className={card}>
            {head(s.stockOverview, en.stockOverview)}
            <p className="text-4xl font-bold">{stats.total}</p>
            <p className="mb-3 text-sm text-gray-500">{s.totalItems}</p>
            <div className="flex h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-leaf" style={{ width: pct(stats.healthy) }} />
              <div className="bg-turmeric" style={{ width: pct(stats.low) }} />
              <div className="bg-red-500" style={{ width: pct(stats.out) }} />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              <div><p className="text-xl font-bold text-leaf">{stats.healthy}</p><p className="text-xs text-gray-500">🟢 {s.healthy}</p></div>
              <div><p className="text-xl font-bold text-amber-600">{stats.low}</p><p className="text-xs text-gray-500">🟡 {s.lowLabel}</p></div>
              <div><p className="text-xl font-bold text-red-600">{stats.out}</p><p className="text-xs text-gray-500">🔴 {s.outLabel}</p></div>
              <div><p className="text-xl font-bold text-orange-600">{stats.expiring}</p><p className="text-xs text-gray-500">⏳ {s.expiringLabel}</p></div>
            </div>
          </div>

          <div className="rounded-3xl bg-amber-50 p-4">
            <p className="font-bold text-amber-900">🎤 {s.askVoice}</p>
            <p className="text-sm text-amber-800">{s.voiceExample}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <div className={card}>
            {head(s.trendTitle, en.trendTitle)}
            <p className="-mt-2 mb-2 text-xs text-gray-400">{s.last7}</p>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1f7a4d" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1f7a4d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `₹${v}`} />
                  <Area type="monotone" dataKey="total" stroke="#1f7a4d" strokeWidth={3} fill="url(#salesFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={card}>
            {head(s.alertsTitle, en.alertsTitle)}
            {stats.alerts.length === 0 && <p className="text-gray-500">{s.allGood}</p>}
            {stats.alerts.slice(0, 6).map((a) => {
              const c = chip(a);
              return (
                <Link key={a.p._id} href="/products" className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl">{a.p.icon || "🛒"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{displayName(a.p, lang)}</span>
                    <span className="block text-sm text-gray-500">{a.p.stock} {rt.units[a.p.unit] || a.p.unit}</span>
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.cls}`}>{c.text}</span>
                </Link>
              );
            })}
            {stats.alerts.length > 6 && (
              <Link href="/products" className="mt-2 block text-center text-sm font-semibold text-leaf">{s.viewAll} →</Link>
            )}
          </div>

          <Link href="/udhaar" className="block rounded-3xl bg-orange-50 p-5">
            {head(s.udhaarTitle, en.udhaarTitle)}
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-orange-700">₹{report?.udhaarPending ?? 0}</p>
              <p className="text-sm font-semibold text-orange-700">{s.openLedger} →</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}