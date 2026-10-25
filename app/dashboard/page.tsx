"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useLang } from "@/components/LanguageProvider";
import Tilt from "@/components/Tilt";
import CountUp from "@/components/CountUp";
import { LANGS, type LangCode } from "@/lib/languages";
import { SHELL } from "@/lib/text/shell";
import { DASH } from "@/lib/text/dash";
import { reportsText } from "@/lib/text/reports";
import { displayName } from "@/lib/catalog";
import { CATEGORY_ICON, CATEGORY_LABEL, categoryOf, type CategoryKey } from "@/lib/categories";

type Product = {
  _id: string;
  name: string;
  names?: Record<string, string>;
  keys?: string;
  icon?: string;
  unit: string;
  stock: number;
  lowStockLimit: number;
  expiryDate?: string;
  updatedAt?: string;
};
type Report = {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
  daily: { day: string; total: number }[];
  udhaarPending: number;
};
type Sale = {
  _id: string;
  total: number;
  paymentType: "cash" | "credit";
  createdAt: string;
  items: { name: string; qty: number }[];
};
type Alert = { p: Product; kind: "out" | "expired" | "today" | "low" | "soon"; days: number; rank: number };

const BCP: Record<LangCode, string> = { hi: "hi-IN", en: "en-IN", mr: "mr-IN", te: "te-IN" };
const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
const card = "depth rounded-3xl border border-amber-100 bg-white p-5";
const delay = (i: number) => ({ "--d": `${i * 90}ms` }) as React.CSSProperties;

export default function Dashboard() {
  const router = useRouter();
  const { lang, setLang } = useLang();
  const s = SHELL[lang];
  const en = SHELL.en;
  const dd = DASH[lang];
  const den = DASH.en;
  const rt = reportsText[lang];
  const catLabel = CATEGORY_LABEL[lang];

  const [shop, setShop] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (user) setShop(JSON.parse(user).shopName || "");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/products", { headers }),
      fetch("/api/reports", { headers }),
      fetch("/api/sales", { headers }),
    ])
      .then(async ([p, r, sl]) => {
        if (p.status === 401 || r.status === 401 || sl.status === 401) {
          router.push("/login");
          return;
        }
        if (p.ok) setProducts((await p.json()).products);
        if (r.ok) setReport(await r.json());
        if (sl.ok) setSales(((await sl.json()).sales as Sale[]).slice(0, 6));
        setTimeout(() => setReady(true), 80);
      })
      .catch(() => {});
  }, [router]);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const dateText = now ? now.toLocaleDateString(BCP[lang], { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
  const timeText = now ? now.toLocaleTimeString(BCP[lang], { hour: "2-digit", minute: "2-digit" }) : "";

  const byName = useMemo(
    () => new Map<string, Product>(products.map((p): [string, Product] => [p.name, p])),
    [products]
  );
  const localName = (n: string) => {
    const p = byName.get(n);
    return p ? displayName(p, lang) : n;
  };
  const iconOf = (n: string) => byName.get(n)?.icon || "🛒";

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => [p.name, p.names?.hi, p.names?.mr, p.names?.te, p.keys].some((v) => v && v.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [query, products]);

  const stats = useMemo(() => {
    const total = products.length;
    const out = products.filter((p) => p.stock === 0).length;
    const low = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockLimit).length;
    const expiring = products.filter((p) => p.expiryDate && daysLeft(p.expiryDate) <= 7).length;

    const alerts: Alert[] = [];
    products.forEach((p) => {
      const dl = p.expiryDate ? daysLeft(p.expiryDate) : null;
      if (p.stock === 0) alerts.push({ p, kind: "out", days: 0, rank: 0 });
      else if (dl !== null && dl < 0) alerts.push({ p, kind: "expired", days: dl, rank: 1 });
      else if (dl === 0) alerts.push({ p, kind: "today", days: 0, rank: 2 });
      else if (p.stock <= p.lowStockLimit) alerts.push({ p, kind: "low", days: dl ?? 99, rank: 3 });
      else if (dl !== null && dl <= 7) alerts.push({ p, kind: "soon", days: dl, rank: 4 });
    });
    alerts.sort((a, b) => a.rank - b.rank || a.p.stock - b.p.stock);

    const cats = new Map<CategoryKey, { count: number; low: number }>();
    products.forEach((p) => {
      const k = categoryOf(p);
      const c = cats.get(k) || { count: 0, low: 0 };
      c.count += 1;
      if (p.stock <= p.lowStockLimit) c.low += 1;
      cats.set(k, c);
    });
    const topCats = [...cats.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 4);

    const recent = [...products]
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 6);

    return { total, out, low, expiring, healthy: total - out - low, alerts, topCats, recent };
  }, [products]);

  const pct = (n: number) => (ready && stats.total ? `${(n / stats.total) * 100}%` : "0%");
  const chart = (report?.daily ?? []).map((x) => ({ ...x, day: rt.days[x.day] || x.day }));

  const chip = (a: Alert) => {
    switch (a.kind) {
      case "out": return { text: s.stOut, cls: "bg-red-100 text-red-700" };
      case "expired": return { text: s.stExpired, cls: "bg-red-100 text-red-700" };
      case "today": return { text: s.stExpiresToday, cls: "bg-red-100 text-red-700" };
      case "low": return { text: s.stLow, cls: "bg-amber-100 text-amber-800" };
      default: return { text: s.stExpiresIn(a.days), cls: "bg-orange-100 text-orange-700" };
    }
  };
  const statusOf = (p: Product) =>
    p.stock === 0
      ? { text: s.stOut, cls: "bg-red-100 text-red-700" }
      : p.stock <= p.lowStockLimit
      ? { text: s.stLow, cls: "bg-amber-100 text-amber-800" }
      : { text: s.healthy, cls: "bg-emerald-100 text-emerald-800" };

  const head = (main: string, sub: string) => (
    <div className="mb-3">
      <p className="font-bold">{main}</p>
      {lang !== "en" && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );

  const menuItem = "flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left font-semibold hover:bg-amber-50";

  return (
    <main className="mx-auto max-w-7xl space-y-5 p-4 pb-28 lg:p-8 lg:pb-12">
      {/* Header: title, search, clock, profile */}
      <div className="fade-up relative z-20 flex flex-wrap items-center gap-4" style={delay(0)}>
        <div className="min-w-0 flex-1">
          <p className="text-gray-500">{s.hello}</p>
          <h1 className="text-2xl font-bold text-leaf-dark lg:text-3xl">{shop || "Vyapar Setu"}</h1>
          {dateText && <p className="text-sm text-gray-400 md:hidden">{dateText} · {timeText}</p>}
        </div>

        <div className="relative order-last w-full lg:order-0 lg:w-96">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`🔍 ${dd.searchPh}`}
            className="depth w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 outline-none focus:border-leaf"
          />
          {query.trim() && (
            <div className="absolute left-0 right-0 top-14 z-50 rounded-2xl bg-white p-2 shadow-2xl">
              {matches.length === 0 && <p className="p-3 text-gray-500">{dd.noMatch}</p>}
              {matches.map((p) => (
                <Link key={p._id} href="/products" onClick={() => setQuery("")} className="flex items-center gap-3 rounded-xl p-2 hover:bg-amber-50">
                  <span className="text-2xl">{p.icon || "🛒"}</span>
                  <span className="min-w-0 flex-1 truncate font-semibold">{displayName(p, lang)}</span>
                  <span className="text-sm text-gray-500">{p.stock} {rt.units[p.unit] || p.unit}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {dateText && (
          <div className="hidden text-right md:block">
            <p className="font-semibold">{dateText}</p>
            <p className="text-sm text-gray-500">{timeText}</p>
          </div>
        )}

        <div className="relative">
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
      </div>

      {/* Quick actions + voice tip */}
      <div className="fade-up flex flex-col gap-3 lg:flex-row" style={delay(1)}>
        <div className="grid grid-cols-2 gap-3 lg:w-1/2">
          <Link href="/billing" className="depth rounded-2xl bg-leaf p-4 text-center text-lg font-bold text-white active:scale-95">
            🧾 {s.quickBill}
          </Link>
          <Link href="/products" className="rounded-2xl bg-emerald-100 p-4 text-center text-lg font-bold text-emerald-900 active:scale-95">
            📦 {s.quickStock}
          </Link>
        </div>
        <div className="flex-1 rounded-2xl bg-amber-50 px-5 py-3">
          <p className="font-bold text-amber-900">🎤 {s.askVoice}</p>
          <p className="text-sm text-amber-800">{s.voiceExample}</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Tilt className="fade-up col-span-2 lg:col-span-1" style={delay(2)}>
          <div className="shine depth h-full rounded-3xl bg-linear-to-br from-leaf to-leaf-dark p-5 text-white">
            <p className="opacity-80">💰 {s.todaySales}</p>
            <p className="text-4xl font-bold"><CountUp value={report?.today.total ?? 0} prefix="₹" /></p>
            <p className="text-sm opacity-80">{s.bills(report?.today.count ?? 0)}</p>
          </div>
        </Tilt>
        <Tilt className="fade-up" style={delay(3)}>
          <div className={`${card} h-full`}>
            <p className="text-gray-500">📅 {s.last7}</p>
            <p className="text-3xl font-bold"><CountUp value={report?.week.total ?? 0} prefix="₹" /></p>
            <p className="text-sm text-gray-400">{s.bills(report?.week.count ?? 0)}</p>
          </div>
        </Tilt>
        <Tilt className="fade-up" style={delay(4)}>
          <div className={`${card} h-full`}>
            <p className="text-gray-500">🗓️ {dd.last30}</p>
            <p className="text-3xl font-bold"><CountUp value={report?.month.total ?? 0} prefix="₹" /></p>
            <p className="text-sm text-gray-400">{s.bills(report?.month.count ?? 0)}</p>
          </div>
        </Tilt>
        <Tilt className="fade-up col-span-2 lg:col-span-1" style={delay(5)}>
          <Link href="/udhaar" className="depth block h-full rounded-3xl bg-orange-50 p-5">
            <p className="text-orange-700">📒 {s.udhaarTitle}</p>
            <p className="text-3xl font-bold text-orange-700"><CountUp value={report?.udhaarPending ?? 0} prefix="₹" /></p>
            <p className="text-sm font-semibold text-orange-700">{s.openLedger} →</p>
          </Link>
        </Tilt>
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: overview + categories */}
        <div className="space-y-4 lg:col-span-5">
          <div className={`${card} fade-up`} style={delay(6)}>
            {head(s.stockOverview, en.stockOverview)}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-5xl font-bold"><CountUp value={stats.total} /></p>
                <p className="text-sm text-gray-500">{s.totalItems}</p>
              </div>
            </div>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-gray-100">
              <div className="bg-leaf transition-[width] duration-1000 ease-out" style={{ width: pct(stats.healthy) }} />
              <div className="bg-turmeric transition-[width] duration-1000 ease-out" style={{ width: pct(stats.low) }} />
              <div className="bg-red-500 transition-[width] duration-1000 ease-out" style={{ width: pct(stats.out) }} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <div className="rounded-2xl bg-emerald-50 p-2"><p className="text-xl font-bold text-leaf">{stats.healthy}</p><p className="text-[11px] text-gray-600">🟢 {s.healthy}</p></div>
              <div className="rounded-2xl bg-amber-50 p-2"><p className="text-xl font-bold text-amber-600">{stats.low}</p><p className="text-[11px] text-gray-600">🟡 {s.lowLabel}</p></div>
              <div className="rounded-2xl bg-red-50 p-2"><p className="text-xl font-bold text-red-600">{stats.out}</p><p className="text-[11px] text-gray-600">🔴 {s.outLabel}</p></div>
              <div className="rounded-2xl bg-orange-50 p-2"><p className="text-xl font-bold text-orange-600">{stats.expiring}</p><p className="text-[11px] text-gray-600">⏳ {s.expiringLabel}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {stats.topCats.map(([key, c], i) => (
              <Tilt key={key} className="fade-up" style={delay(7 + i)}>
                <Link href="/products" className="depth block h-full rounded-3xl border border-amber-100 bg-linear-to-br from-white to-amber-50 p-4">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{CATEGORY_ICON[key]}</span>
                    <span className="text-2xl font-bold text-leaf-dark"><CountUp value={c.count} /></span>
                  </div>
                  <p className="mt-2 font-bold leading-tight">{catLabel[key]}</p>
                  <p className="text-xs text-gray-500">{dd.itemsCount(c.count)}</p>
                  <p className={`mt-1 text-xs font-semibold ${c.low > 0 ? "text-amber-600" : "text-emerald-700"}`}>
                    {c.low > 0 ? `🟡 ${dd.lowCount(c.low)}` : `✓ ${dd.allOk}`}
                  </p>
                </Link>
              </Tilt>
            ))}
          </div>
        </div>

        {/* Right: trend + alerts */}
        <div className="space-y-4 lg:col-span-7">
          <div className={`${card} fade-up`} style={delay(6)}>
            {head(s.trendTitle, en.trendTitle)}
            <p className="-mt-2 mb-2 text-xs text-gray-400">{s.last7}</p>
            <div className="h-56">
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
                  <Area type="monotone" dataKey="total" stroke="#1f7a4d" strokeWidth={3} fill="url(#salesFill)" animationDuration={1200} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`${card} fade-up`} style={delay(8)}>
            {head(s.alertsTitle, en.alertsTitle)}
            {stats.alerts.length === 0 && <p className="text-gray-500">{s.allGood}</p>}
            <div className="grid gap-x-8 md:grid-cols-2">
              {stats.alerts.slice(0, 8).map((a) => {
                const c = chip(a);
                return (
                  <Link key={a.p._id} href="/products" className="flex items-center gap-3 border-b border-gray-100 py-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-2xl">{a.p.icon || "🛒"}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{displayName(a.p, lang)}</span>
                      <span className="block text-sm text-gray-500">{a.p.stock} {rt.units[a.p.unit] || a.p.unit}</span>
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${c.cls}`}>{c.text}</span>
                  </Link>
                );
              })}
            </div>
            {stats.alerts.length > 8 && (
              <Link href="/products" className="mt-3 block text-center text-sm font-semibold text-leaf">{s.viewAll} →</Link>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row: recent products + recent bills */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className={`${card} fade-up overflow-x-auto lg:col-span-7`} style={delay(9)}>
          {head(dd.recentProducts, den.recentProducts)}
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                <th className="py-2 font-semibold">{dd.colProduct}</th>
                <th className="hidden py-2 font-semibold sm:table-cell">{dd.colCategory}</th>
                <th className="py-2 font-semibold">{dd.colStock}</th>
                <th className="py-2 text-right font-semibold">{dd.colStatus}</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((p) => {
                const st = statusOf(p);
                return (
                  <tr key={p._id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl">{p.icon || "🛒"}</span>
                        <span className="font-semibold">{displayName(p, lang)}</span>
                      </span>
                    </td>
                    <td className="hidden py-3 text-sm text-gray-500 sm:table-cell">{catLabel[categoryOf(p)]}</td>
                    <td className="py-3 font-semibold">{p.stock} <span className="text-sm font-normal text-gray-400">{rt.units[p.unit] || p.unit}</span></td>
                    <td className="py-3 text-right"><span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.text}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className={`${card} fade-up lg:col-span-5`} style={delay(10)}>
          {head(dd.recentBills, den.recentBills)}
          {sales.length === 0 && <p className="text-gray-500">{dd.noBills}</p>}
          {sales.map((sale) => {
            const first = sale.items[0];
            return (
              <div key={sale._id} className="flex items-center gap-3 border-b border-gray-100 py-3 last:border-0">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  {first ? iconOf(first.name) : "🧾"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {first ? localName(first.name) : "—"}
                    {sale.items.length > 1 && <span className="font-normal text-gray-400"> {dd.moreItems(sale.items.length - 1)}</span>}
                  </span>
                  <span className="block text-xs text-gray-400">
                    {new Date(sale.createdAt).toLocaleString(BCP[lang], { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-bold">₹{sale.total}</span>
                  <span className={`text-xs font-bold ${sale.paymentType === "credit" ? "text-orange-600" : "text-emerald-700"}`}>
                    {sale.paymentType === "credit" ? dd.credit : dd.cash}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}