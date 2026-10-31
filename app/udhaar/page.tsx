"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import { useLang } from "@/components/LanguageProvider";
import { udhaarText } from "@/lib/text/udhaar";

type Customer = { _id: string; name: string; phone: string; balance: number };

const colors = ["bg-orange-200", "bg-emerald-200", "bg-sky-200", "bg-pink-200", "bg-violet-200"];

export default function UdhaarPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const s = udhaarText[lang];

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Customer | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

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
  const res = await api("/api/customers");
  if (res?.ok) {
    setCustomers((await res.json()).customers);
    setLoaded(true);
  }
}, [api]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function openSheet(c: Customer) {
    setActive(c);
    setAmount("");
    setError("");
  }

  async function submit() {
    if (!active) return;
    const amt = Number(amount);
    if (!(amt > 0)) return setError(s.errAmount);
    if (amt > active.balance) return setError(s.errMore(active.balance));

    setSaving(true);
    const res = await api("/api/payments", {
      method: "POST",
      body: JSON.stringify({ customerId: active._id, amount: amt }),
    });
    setSaving(false);
    if (!res) return;
    if (!res.ok) return setError(s.generic);

    setToast(`✅ ${s.toast(active.name, amt)}`);
    setActive(null);
    load();
  }

  function remind(c: Customer) {
    const shop = JSON.parse(localStorage.getItem("user") || "{}").shopName || s.defaultShop;
    const phone = c.phone ? `91${c.phone.replace(/\D/g, "").slice(-10)}` : "";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(s.reminder(c.name, shop, c.balance))}`, "_blank");
  }

  const pending = customers.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance);
  const totalPending = pending.reduce((sum, c) => sum + c.balance, 0);

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-dark">📒 {s.title}</h1>
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
          {t("back")}
        </Link>
      </div>

      <div className="rounded-3xl bg-linear-to-br from-leaf to-leaf-dark p-6 text-white shadow-lg">
        <p className="opacity-80">{s.totalLabel}</p>
        <p className="text-5xl font-bold">₹{totalPending}</p>
        <p className="mt-2 text-sm opacity-80">{s.countLabel(pending.length)}</p>
      </div>

    {!loaded && <p className="p-6 text-center text-gray-400">⏳</p>} 
      {loaded && pending.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-5xl">🎉</p>
          <p className="mt-2 text-lg font-semibold">{s.none}</p>
        </div>
      )}

      {pending.map((c, i) => (
        <div key={c._id} className="rounded-3xl border border-amber-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold ${colors[i % colors.length]}`}>
              {c.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold">{c.name}</p>
              <p className="text-sm text-gray-500">{c.phone || s.noPhone}</p>
            </div>
            <p className="text-2xl font-bold text-turmeric">₹{c.balance}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button onClick={() => openSheet(c)} className="rounded-2xl bg-leaf p-3 font-semibold text-white active:scale-95">
              💵 {s.received}
            </button>
            <button onClick={() => remind(c)} className="rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800 active:scale-95">
              💬 {s.remind}
            </button>
          </div>
        </div>
      ))}

      <Modal open={!!active} onClose={() => setActive(null)} title={active ? s.sheetTitle(active.name) : ""}>
        {active && (
          <div className="space-y-4">
            <p className="text-gray-600">{s.totalDue}: <span className="font-bold text-turmeric">₹{active.balance}</span></p>

            <input
              autoFocus
              type="number"
              inputMode="numeric"
              placeholder={s.amountPh}
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(""); }}
              className="w-full rounded-2xl border-2 border-gray-200 p-4 text-3xl font-bold outline-none focus:border-leaf"
            />

            <div className="flex flex-wrap gap-2">
              {[100, 500].filter((v) => v < active.balance).map((v) => (
                <button key={v} onClick={() => setAmount(String(v))} className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-800">
                  ₹{v}
                </button>
              ))}
              <button onClick={() => setAmount(String(active.balance))} className="rounded-full bg-emerald-50 px-4 py-2 font-semibold text-emerald-800">
                {s.full(active.balance)}
              </button>
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 font-semibold text-red-600">{error}</p>}

            <button onClick={submit} disabled={saving} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white active:scale-95 disabled:opacity-60">
              {saving ? s.wait : `✅ ${s.deposit}`}
            </button>
          </div>
        )}
      </Modal>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-leaf-dark px-6 py-3 font-semibold text-white shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}