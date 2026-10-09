"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  _id: string;
  name: string;
  unit: string;
  price: number;
  stock: number;
  lowStockLimit: number;
};

const empty = { name: "", unit: "kg", price: "", stock: "", lowStockLimit: "5" };

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    if (res?.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }, [api, search]);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setRole(JSON.parse(u).role);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
    if (!res.ok) return setError(data.error || "Kuch galat hua");
    setForm(empty);
    setShowForm(false);
    load();
  }

  async function addStock(p: Product) {
    const qty = Number(prompt(`${p.name}: kitna stock add karna hai?`));
    if (!qty || qty <= 0) return;
    await api(`/api/products/${p._id}`, {
      method: "PUT",
      body: JSON.stringify({ stock: p.stock + qty }),
    });
    load();
  }

  async function remove(p: Product) {
    if (!confirm(`${p.name} hata dein?`)) return;
    await api(`/api/products/${p._id}`, { method: "DELETE" });
    load();
  }

  const input =
    "w-full rounded-xl border-2 border-gray-300 p-3 text-lg outline-none focus:border-green-600";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-bold text-green-700">📦 सामान (Products)</h1>

      <input
        className={input}
        placeholder="🔍 सामान खोजें (Search)"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {role === "owner" && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full rounded-xl bg-green-600 p-4 text-xl font-semibold text-white"
        >
          {showForm ? "बंद करें" : "➕ नया सामान जोड़ें"}
        </button>
      )}

      {showForm && (
        <div className="space-y-3 rounded-2xl bg-green-50 p-4">
          <input className={input} placeholder="नाम (Name)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className={input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
            <option value="kg">kg</option>
            <option value="litre">litre</option>
            <option value="pcs">pcs</option>
            <option value="packet">packet</option>
          </select>
          <input className={input} type="number" placeholder="दाम (Price ₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          <input className={input} type="number" placeholder="कितना माल है (Stock)" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          <input className={input} type="number" placeholder="कम होने की सीमा (Low stock limit)" value={form.lowStockLimit} onChange={(e) => setForm({ ...form, lowStockLimit: e.target.value })} />
          {error && <p className="rounded-lg bg-red-50 p-3 text-red-600">{error}</p>}
          <button onClick={addProduct} className="w-full rounded-xl bg-green-700 p-4 text-xl font-semibold text-white">
            सेव करें
          </button>
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && (
          <p className="p-6 text-center text-gray-500">कोई सामान नहीं मिला</p>
        )}
        {products.map((p) => {
          const out = p.stock === 0;
          const low = p.stock <= p.lowStockLimit;
          return (
            <div key={p._id} className={`rounded-2xl border-2 p-4 ${out ? "border-red-500 bg-red-50" : low ? "border-yellow-500 bg-yellow-50" : "border-green-500 bg-green-50"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">{p.name}</p>
                  <p className="text-gray-600">₹{p.price} / {p.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{p.stock} {p.unit}</p>
                  <p className="text-sm font-semibold">
                    {out ? "🔴 खत्म" : low ? "🟡 कम है" : "🟢 ठीक है"}
                  </p>
                </div>
              </div>
              {role === "owner" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => addStock(p)} className="flex-1 rounded-xl bg-green-600 p-3 font-semibold text-white">
                    ➕ माल आया
                  </button>
                  <button onClick={() => remove(p)} className="rounded-xl bg-red-100 p-3 font-semibold text-red-700">
                    🗑 हटाएं
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}