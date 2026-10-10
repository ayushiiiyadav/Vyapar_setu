"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

type Stock = { _id: string; name: string; stock: number; unit: string };
type Report = {
  today: { total: number; count: number };
  week: { total: number; count: number };
  month: { total: number; count: number };
  daily: { day: string; total: number }[];
  cash: number;
  credit: number;
  top: { _id: string; qty: number; revenue: number }[];
  slow: Stock[];
  low: Stock[];
  udhaarPending: number;
};

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");
    fetch("/api/reports", { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => {
      if (r.status === 401) return router.push("/login");
      const d = await r.json();
      if (!r.ok) return setError(d.error || "कुछ गलत हुआ");
      setData(d);
    });
  }, [router]);

  const card = "rounded-3xl bg-white p-5 shadow-sm";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-dark">📊 रिपोर्ट</h1>
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
          ← वापस
        </Link>
      </div>

      {error && <p className="rounded-2xl bg-red-50 p-4 font-semibold text-red-600">{error}</p>}
      {!data && !error && <p className="p-6 text-center text-gray-500">रुकिए...</p>}

      {data && (
        <>
          <div className="rounded-3xl bg-linear-to-br from-leaf to-leaf-dark p-6 text-white shadow-lg">
            <p className="opacity-80">आज की बिक्री</p>
            <p className="text-5xl font-bold">₹{data.today.total}</p>
            <p className="mt-1 text-sm opacity-80">{data.today.count} बिल</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={card}>
              <p className="text-gray-500">पिछले 7 दिन</p>
              <p className="text-2xl font-bold">₹{data.week.total}</p>
            </div>
            <div className={card}>
              <p className="text-gray-500">पिछले 30 दिन</p>
              <p className="text-2xl font-bold">₹{data.month.total}</p>
            </div>
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">रोज़ की बिक्री (7 दिन)</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.daily}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `₹${v}`} cursor={{ fill: "#fff7e8" }} />
                  <Bar dataKey="total" fill="#1f7a4d" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-emerald-50 p-5">
              <p className="text-emerald-800">💵 नकद (30 दिन)</p>
              <p className="text-2xl font-bold text-emerald-800">₹{data.cash}</p>
            </div>
            <div className="rounded-3xl bg-orange-50 p-5">
              <p className="text-orange-700">📒 उधार (30 दिन)</p>
              <p className="text-2xl font-bold text-orange-700">₹{data.credit}</p>
            </div>
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">🏆 सबसे ज़्यादा बिकने वाला (30 दिन)</p>
            {data.top.length === 0 && <p className="text-gray-500">अभी कोई बिक्री नहीं</p>}
            {data.top.map((t, i) => (
              <div key={t._id} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                <span>{i + 1}. {t._id}</span>
                <span className="font-semibold">{t.qty} बिके · ₹{t.revenue}</span>
              </div>
            ))}
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">🐢 धीमा बिकने वाला (14 दिन में नहीं बिका)</p>
            {data.slow.length === 0 && <p className="text-gray-500">कोई नहीं 👍</p>}
            {data.slow.map((p) => (
              <div key={p._id} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                <span>{p.name}</span>
                <span className="text-gray-500">{p.stock} {p.unit} पड़ा है</span>
              </div>
            ))}
          </div>

          <div className={card}>
            <p className="mb-2 font-bold">🟡 कम / खत्म स्टॉक</p>
            {data.low.length === 0 && <p className="text-gray-500">सब ठीक है 👍</p>}
            {data.low.map((p) => (
              <div key={p._id} className="flex justify-between border-b border-gray-100 py-2 last:border-0">
                <span>{p.name}</span>
                <span className={p.stock === 0 ? "font-bold text-red-600" : "font-semibold text-turmeric"}>
                  {p.stock === 0 ? "खत्म" : `${p.stock} ${p.unit}`}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-3xl bg-orange-50 p-5 text-center">
            <p className="text-orange-700">कुल उधार बाकी</p>
            <p className="text-3xl font-bold text-orange-700">₹{data.udhaarPending}</p>
          </div>
        </>
      )}
    </main>
  );
}