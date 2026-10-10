"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";

type Product = {
  _id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  lowStockLimit: number;
};
type Sheet = { kind: "add" } | { kind: "stock"; p: Product } | { kind: "delete"; p: Product } | null;

const empty = { name: "", unit: "kg", price: "", stock: "", lowStockLimit: "5" };
const input = "w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-lg outline-none focus:border-leaf";

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(empty);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [role, setRole] = useState("owner");

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
    const res = await api(`/api/products?search=${encodeURIComponent(search)}`);
    if (res?.ok) setProducts((await res.json()).products);
  }, [api, search]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setRole(JSON.parse(u).role);
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  function open(s: Sheet) {
    setSheet(s);
    setQty("");
    setError("");
  }

  async function addProduct() {
    setError("");
    const res = await api("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        unit: form.unit,
        price: Number(form.price),
        stock: Number(form.stock),
        lowStockLimit: Number(form.lowStockLimit),
      }),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) return setError(data.error || "कुछ गलत हुआ");
    setForm(empty);
    setSheet(null);
    setToast(`✅ ${data.name} जुड़ गया`);
    load();
  }

  async function addStock(p: Product) {
    const n = Number(qty);
    if (!(n > 0)) return setError("सही मात्रा लिखें");
    const res = await api(`/api/products/${p._id}`, {
      method: "PUT",
      body: JSON.stringify({ stock: p.stock + n }),
    });
    if (!res) return;
    if (!res.ok) return setError("कुछ गलत हुआ");
    setSheet(null);
    setToast(`✅ ${p.name}: ${n} ${p.unit} माल जुड़ा`);
    load();
  }

  async function remove(p: Product) {
    await api(`/api/products/${p._id}`, { method: "DELETE" });
    setSheet(null);
    setToast(`🗑 ${p.name} हटा दिया`);
    load();
  }

  const title =
    sheet?.kind === "add" ? "नया सामान जोड़ें" : sheet?.kind === "stock" ? `${sheet.p.name}: माल आया` : sheet?.kind === "delete" ? "सामान हटाएं?" : "";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-dark">📦 सामान / स्टॉक</h1>
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
          ← वापस
        </Link>
      </div>

      <input className={input} placeholder="🔍 सामान खोजें" value={search} onChange={(e) => setSearch(e.target.value)} />

      {role === "owner" && (
        <button onClick={() => open({ kind: "add" })} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white shadow active:scale-95">
          ➕ नया सामान जोड़ें
        </button>
      )}

      {products.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-5xl">📦</p>
          <p className="mt-2 font-semibold">कोई सामान नहीं मिला</p>
        </div>
      )}

      {products.map((p) => {
        const out = p.stock === 0;
        const low = p.stock <= p.lowStockLimit;
        const bar = out ? "border-red-500" : low ? "border-turmeric" : "border-leaf";
        const label = out ? "🔴 खत्म" : low ? "🟡 कम है" : "🟢 ठीक है";
        return (
          <div key={p._id} className={`rounded-3xl border-l-8 bg-white p-4 shadow-sm ${bar}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{p.name}</p>
                <p className="text-gray-500">₹{p.price} / {p.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{p.stock} <span className="text-base font-normal">{p.unit}</span></p>
                <p className="text-sm font-semibold">{label}</p>
              </div>
            </div>
            {role === "owner" && (
              <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                <button onClick={() => open({ kind: "stock", p })} className="rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800 active:scale-95">
                  ➕ माल आया
                </button>
                <button onClick={() => open({ kind: "delete", p })} className="rounded-2xl bg-red-50 px-4 font-semibold text-red-600 active:scale-95">
                  🗑
                </button>
              </div>
            )}
          </div>
        );
      })}

      <Modal open={!!sheet} onClose={() => setSheet(null)} title={title}>
        {sheet?.kind === "add" && (
          <div className="space-y-3">
            <input className={input} placeholder="नाम (जैसे: चावल)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className={input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                <option value="kg">kg</option>
                <option value="litre">litre</option>
                <option value="pcs">pcs</option>
                <option value="packet">packet</option>
              </select>
              <input className={input} type="number" inputMode="numeric" placeholder="दाम ₹" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={input} type="number" inputMode="numeric" placeholder="कितना माल है" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <input className={input} type="number" inputMode="numeric" placeholder="कम होने की सीमा" value={form.lowStockLimit} onChange={(e) => setForm({ ...form, lowStockLimit: e.target.value })} />
            </div>
            {error && <p className="rounded-xl bg-red-50 p-3 font-semibold text-red-600">{error}</p>}
            <button onClick={addProduct} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white active:scale-95">
              ✅ सेव करें
            </button>
          </div>
        )}

        {sheet?.kind === "stock" && (
          <div className="space-y-4">
            <p className="text-gray-600">अभी स्टॉक: <span className="font-bold">{sheet.p.stock} {sheet.p.unit}</span></p>
            <input autoFocus type="number" inputMode="numeric" placeholder={`कितना ${sheet.p.unit} आया?`} value={qty} onChange={(e) => { setQty(e.target.value); setError(""); }} className="w-full rounded-2xl border-2 border-gray-200 p-4 text-3xl font-bold outline-none focus:border-leaf" />
            <div className="flex gap-2">
              {[5, 10, 25, 50].map((v) => (
                <button key={v} onClick={() => setQty(String(v))} className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-800">
                  +{v}
                </button>
              ))}
            </div>
            {error && <p className="rounded-xl bg-red-50 p-3 font-semibold text-red-600">{error}</p>}
            <button onClick={() => addStock(sheet.p)} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white active:scale-95">
              ✅ माल जोड़ें
            </button>
          </div>
        )}

        {sheet?.kind === "delete" && (
          <div className="space-y-4">
            <p className="text-lg">क्या आप <span className="font-bold">{sheet.p.name}</span> को हटाना चाहते हैं?</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSheet(null)} className="rounded-2xl bg-gray-100 p-4 font-bold">
                नहीं
              </button>
              <button onClick={() => remove(sheet.p)} className="rounded-2xl bg-red-600 p-4 font-bold text-white">
                हाँ, हटाएं
              </button>
            </div>
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