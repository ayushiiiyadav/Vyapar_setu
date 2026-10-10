"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Customer = { _id: string; name: string; phone: string; balance: number };

export default function UdhaarPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

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
    if (res?.ok) setCustomers((await res.json()).customers);
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  async function receive(c: Customer) {
    const input = prompt(`${c.name}: कितने रुपये मिले? (बाकी ₹${c.balance})`);
    const amount = Number(input);
    if (!amount || amount <= 0) return;
    setMessage(null);
    const res = await api("/api/payments", {
      method: "POST",
      body: JSON.stringify({ customerId: c._id, amount }),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) return setMessage({ type: "err", text: data.error || "कुछ गलत हुआ" });
    setMessage({ type: "ok", text: `✅ ₹${amount} जमा हुए` });
    load();
  }

  function remind(c: Customer) {
    const shop = JSON.parse(localStorage.getItem("user") || "{}").shopName || "हमारी दुकान";
    const text = `नमस्ते ${c.name} जी, ${shop} से याद दिलाना है कि आपका ₹${c.balance} बाकी है। कृपया सुविधा से जमा कर दें। धन्यवाद 🙏`;
    const phone = c.phone ? `91${c.phone.replace(/\D/g, "").slice(-10)}` : "";
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
  }

  const pending = customers.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance);
  const totalPending = pending.reduce((s, c) => s + c.balance, 0);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-orange-600">📒 उधार खाता</h1>
        <Link href="/dashboard" className="rounded-xl bg-gray-100 px-4 py-2 font-semibold">
          ← वापस
        </Link>
      </div>

      <div className="rounded-2xl bg-orange-50 p-5 text-center">
        <p className="font-semibold">कुल बाकी (Total pending)</p>
        <p className="text-4xl font-bold text-orange-600">₹{totalPending}</p>
      </div>

      {message && (
        <p className={`rounded-xl p-4 text-lg font-semibold ${message.type === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </p>
      )}

      {pending.length === 0 && <p className="p-6 text-center text-gray-500">किसी का उधार बाकी नहीं 🎉</p>}

      {pending.map((c) => (
        <div key={c._id} className="rounded-2xl border-2 border-orange-300 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{c.name}</p>
              {c.phone && <p className="text-gray-600">{c.phone}</p>}
            </div>
            <p className="text-2xl font-bold text-orange-600">₹{c.balance}</p>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={() => receive(c)} className="flex-1 rounded-xl bg-green-600 p-3 font-semibold text-white">
              💵 पैसे मिले
            </button>
            <button onClick={() => remind(c)} className="flex-1 rounded-xl bg-emerald-100 p-3 font-semibold text-emerald-800">
              💬 याद दिलाएं
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}