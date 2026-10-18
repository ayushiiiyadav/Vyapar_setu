"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import { billingText } from "@/lib/text/billing";

type Product = { _id: string; name: string; unit: string; price: number; stock: number };
type CartItem = Product & { qty: number };
type Customer = { _id: string; name: string; balance: number };

export default function BillingPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const s = billingText[lang];
  const unit = (u: string) => s.units[u] || u;
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [payment, setPayment] = useState<"cash" | "credit">("cash");
  const [customerId, setCustomerId] = useState("");
  const [newName, setNewName] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

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

  const loadProducts = useCallback(async () => {
    const res = await api(`/api/products?search=${encodeURIComponent(search)}`);
    if (res?.ok) setProducts((await res.json()).products);
  }, [api, search]);

  const loadCustomers = useCallback(async () => {
    const res = await api("/api/customers");
    if (res?.ok) setCustomers((await res.json()).customers);
  }, [api]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  function add(p: Product) {
    setMessage(null);
    setCart((c) => {
      const found = c.find((i) => i._id === p._id);
      if (found) {
        if (found.qty + 1 > p.stock) return c;
        return c.map((i) => (i._id === p._id ? { ...i, qty: i.qty + 1 } : i));
      }
      if (p.stock < 1) return c;
      return [...c, { ...p, qty: 1 }];
    });
  }

  function change(id: string, delta: number) {
    setCart((c) =>
      c
        .map((i) => (i._id === id ? { ...i, qty: Math.min(i.qty + delta, i.stock) } : i))
        .filter((i) => i.qty > 0)
    );
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  async function confirmBill() {
    setMessage(null);
    if (cart.length === 0) return setMessage({ type: "err", text: s.emptyBill });
    if (payment === "credit" && !customerId && !newName.trim())
      return setMessage({ type: "err", text: s.needCustomer });

    setSaving(true);
    const res = await api("/api/sales", {
      method: "POST",
      body: JSON.stringify({
        items: cart.map((i) => ({ productId: i._id, qty: i.qty })),
        paymentType: payment,
        customerId: customerId || undefined,
        customerName: !customerId ? newName.trim() : undefined,
      }),
    });
    setSaving(false);
    if (!res) return;
    const data = await res.json();
    if (!res.ok)
      return setMessage({ type: "err", text: res.status === 400 ? s.stockLow : s.generic });

    setMessage({ type: "ok", text: `✅ ${s.done(data.total)}` });
    setCart([]);
    setCustomerId("");
    setNewName("");
    setPayment("cash");
    loadProducts();
    loadCustomers();
  }

  const input =
    "w-full rounded-xl border-2 border-gray-300 p-3 text-lg outline-none focus:border-green-600";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700">🧾 {s.title}</h1>
        <Link href="/dashboard" className="rounded-xl bg-gray-100 px-4 py-2 font-semibold">
          {t("back")}
        </Link>
      </div>

      {message && (
        <p className={`rounded-xl p-4 text-lg font-semibold ${message.type === "ok" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}>
          {message.text}
        </p>
      )}

      <input className={input} placeholder={`🔍 ${s.search}`} value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <button
            key={p._id}
            onClick={() => add(p)}
            disabled={p.stock < 1}
            className="rounded-2xl border-2 border-green-500 bg-green-50 p-3 text-left disabled:border-gray-300 disabled:bg-gray-100 disabled:opacity-60"
          >
            <p className="text-lg font-bold">{p.name}</p>
            <p>₹{p.price} / {unit(p.unit)}</p>
            <p className="text-sm text-gray-600">
              {p.stock < 1 ? `🔴 ${s.out}` : s.stock(p.stock, unit(p.unit))}
            </p>
          </button>
        ))}
        {products.length === 0 && <p className="col-span-2 p-4 text-center text-gray-500">{s.noItems}</p>}
      </div>

      <div className="space-y-3 rounded-2xl border-2 border-gray-200 p-4">
        <h2 className="text-xl font-bold">🛒 {s.bill}</h2>
        {cart.length === 0 && <p className="text-gray-500">{s.pickItems}</p>}
        {cart.map((i) => (
          <div key={i._id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{i.name}</p>
              <p className="text-sm text-gray-600">₹{i.price} × {i.qty} = ₹{i.price * i.qty}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => change(i._id, -1)} className="h-10 w-10 rounded-full bg-red-100 text-2xl font-bold text-red-700">−</button>
              <span className="w-6 text-center text-xl font-bold">{i.qty}</span>
              <button onClick={() => change(i._id, 1)} className="h-10 w-10 rounded-full bg-green-100 text-2xl font-bold text-green-700">+</button>
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between border-t-2 pt-3">
          <span className="text-xl font-bold">{s.total}</span>
          <span className="text-3xl font-bold text-green-700">₹{total}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setPayment("cash")} className={`rounded-xl p-4 text-xl font-semibold ${payment === "cash" ? "bg-green-600 text-white" : "bg-gray-100"}`}>
          💵 {s.cash}
        </button>
        <button onClick={() => setPayment("credit")} className={`rounded-xl p-4 text-xl font-semibold ${payment === "credit" ? "bg-orange-500 text-white" : "bg-gray-100"}`}>
          📒 {s.credit}
        </button>
      </div>

      {payment === "credit" && (
        <div className="space-y-3 rounded-2xl bg-orange-50 p-4">
          <select className={input} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">{s.pickCustomer}</option>
            {customers.map((c) => (
              <option key={c._id} value={c._id}>{c.name} ({s.due} ₹{c.balance})</option>
            ))}
          </select>
          {!customerId && (
            <input className={input} placeholder={s.newCustomer} value={newName} onChange={(e) => setNewName(e.target.value)} />
          )}
        </div>
      )}

      <button onClick={confirmBill} disabled={saving} className="w-full rounded-xl bg-green-700 p-5 text-2xl font-bold text-white disabled:opacity-60">
        {saving ? s.wait : `✅ ${s.confirm}`}
      </button>
    </main>
  );
}