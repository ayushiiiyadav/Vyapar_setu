"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useLang } from "@/components/LanguageProvider";
import { reportsText } from "@/lib/text/reports";

// Texts for the profit section (all four languages)
const profitText = {
  en: {
    title: "Profit",
    today: "Today",
    d7: "Last 7 days",
    d30: "Last 30 days",
    margin: "Profit margin (30 days)",
    sales: "Sales",
    profit: "Profit",
    top: "Most profitable items",
    missing: (names: string) => `Cost price missing for ${names}. These are left out of profit.`,
  },
  hi: {
    title: "मुनाफ़ा",
    today: "आज",
    d7: "पिछले 7 दिन",
    d30: "पिछले 30 दिन",
    margin: "मुनाफ़ा प्रतिशत (30 दिन)",
    sales: "बिक्री",
    profit: "मुनाफ़ा",
    top: "सबसे ज़्यादा मुनाफ़े वाला सामान",
    missing: (names: string) => `${names} की ख़रीद कीमत नहीं भरी है। इन्हें मुनाफ़े में नहीं गिना गया।`,
  },
  mr: {
    title: "नफा",
    today: "आज",
    d7: "गेले 7 दिवस",
    d30: "गेले 30 दिवस",
    margin: "नफ्याची टक्केवारी (30 दिवस)",
    sales: "विक्री",
    profit: "नफा",
    top: "सर्वाधिक नफा देणारा माल",
    missing: (names: string) => `${names} ची खरेदी किंमत भरलेली नाही. यांचा नफ्यात समावेश केलेला नाही.`,
  },
  te: {
    title: "లాభం",
    today: "ఈ రోజు",
    d7: "గత 7 రోజులు",
    d30: "గత 30 రోజులు",
    margin: "లాభం శాతం (30 రోజులు)",
    sales: "అమ్మకాలు",
    profit: "లాభం",
    top: "ఎక్కువ లాభం వచ్చే వస్తువులు",
    missing: (names: string) => `${names} కొనుగోలు ధర నమోదు కాలేదు. వీటిని లాభంలో లెక్కించలేదు.`,
  },
};

type Stock = { _id: string; name: string; stock: number; unit: string };
type Report = {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
  daily: { day: string; total: number; profit: number }[];
  cash: number;
  credit: number;
  top: { _id: string; qty: number; revenue: number }[];
  slow: Stock[];
  low: Stock[];
  udhaarPending: number;
  profit: {
    today: { profit: number; margin: number };
    week: { profit: number; margin: number };
    month: { profit: number; margin: number };
  };
  topProfit: { _id: string; qty: number; profit: number }[];
  missingCost: string[];
};

export default function ReportsPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const s = reportsText[lang];
  const pt = profitText[lang as keyof typeof profitText] || profitText.en;
  const unit = (u: string) => s.units[u] || u;

  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    fetch("/api/reports", { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => {
      if (r.status === 401) return router.push("/login");
      if (!r.ok) return setError(true);
      setData(await r.json());
    });
  }, [router]);

  const card = "rounded-3xl bg-white p-5 shadow-sm";
  const chart = data ? data.daily.map((d) => ({ ...d, day: s.days[d.day] || d.day })) : [];

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-dark">📊 {s.title}</h1>
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
          {t("back")}
        </Link>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{s.generic}</p>}
      {!data && !error && <p className="p-6 text-center text-gray-500">{s.wait}</p>}

      {data && (
        <>
          <div className="rounded-3xl bg-linear-to-br from-leaf to-leaf-dark p-6 text-white shadow-lg">
            <p className="opacity-80">{s.todaySales}</p>
            <p className="text-5xl font-bold">₹{data.today.total}</p>
            <p className="mt-1 text-sm opacity-80">{s.bills(data.today.count)}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={card}>
              <p className="text-gray-500">{s.last7}</p>
              <p className="text-2xl font-bold">₹{data.week.total}</p>
            </div>
            <div className={card}>
              <p className="text-gray-500">{s.last30}</p>
              <p className="text-2xl font-bold">₹{data.month.total}</p>
            </div>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-5">
            <p className="mb-3 font-bold text-emerald-800">💰 {pt.title}</p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-sm text-emerald-800">{pt.today}</p>
                <p className="text-xl font-bold text-emerald-800">₹{data.profit.today.profit}</p>
              </div>
              <div>
                <p className="text-sm text-emerald-800">{pt.d7}</p>
                <p className="text-xl font-bold text-emerald-800">₹{data.profit.week.profit}</p>
              </div>
              <div>
                <p className="text-sm text-emerald-800">{pt.d30}</p>
                <p className="text-xl font-bold text-emerald-800">₹{data.profit.month.profit}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-emerald-800">
              {pt.margin}: <span className="font-bold">{data.profit.month.margin}%</span>
            </p>
          </div>

          {data.missingCost.length > 0 && (
            <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              {pt.missing(data.missingCost.join(", "))}
            </p>
          )}

          <div className={card}>
            <p className="mb-2 font-bold">{s.dailyTitle}</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chart}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `₹${v}`} cursor={{ fill: "#fff7e8" }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="total" name={pt.sales} fill="#1f7a4d" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profit" name={pt.profit} fill="#f5a623" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-emerald-800">💵 {s.cash30}</p>
              <p className="text-2xl font-bold text-emerald-800">₹{data.cash}</p>
            </div>
            <div className="rounded-3xl bg-orange-50 p-5">
              <p className="text-orange-700">📒 {s.credit30}</p>
              <p className="text-2xl font-bold text-orange-700">₹{data.credit}</p>
            </div>
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">🏆 {s.topTitle}</p>
            {data.top.length === 0 && <p className="text-gray-500">{s.noSales}</p>}
            {data.top.map((p, i) => (
              <div key={p._id} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                <span>{i + 1}. {p._id}</span>
                <span className="font-semibold">{s.sold(p.qty, p.revenue)}</span>
              </div>
            ))}
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">💰 {pt.top}</p>
            {data.topProfit.length === 0 && <p className="text-gray-500">{s.noSales}</p>}
            {data.topProfit.map((p, i) => (
              <div key={p._id} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                <span>{i + 1}. {p._id}</span>
                <span className="font-semibold text-emerald-800">₹{p.profit}</span>
              </div>
            ))}
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">🐢 {s.slowTitle}</p>
            {data.slow.length === 0 && <p className="text-gray-500">{s.noneGood}</p>}
            {data.slow.map((p) => (
              <div key={p._id} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                <span>{p.name}</span>
                <span className="text-gray-500">{s.lying(p.stock, unit(p.unit))}</span>
              </div>
            ))}
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">🟡 {s.lowTitle}</p>
            {data.low.length === 0 && <p className="text-gray-500">{s.allFine}</p>}
            {data.low.map((p) => (
              <div key={p._id} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                <span>{p.name}</span>
                <span className={p.stock === 0 ? "font-bold text-red-600" : "font-semibold text-turmeric"}>
                  {p.stock === 0 ? s.out : `${p.stock} ${unit(p.unit)}`}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-orange-50 p-5 text-center">
            <p className="text-orange-700">{s.udhaarPending}</p>
            <p className="text-3xl font-bold text-orange-700">₹{data.udhaarPending}</p>
          </div>
        </>
      )}
    </main>
  );
}