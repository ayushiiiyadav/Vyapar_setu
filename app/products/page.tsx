"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Modal from "@/components/Modal";
import { useLang } from "@/components/LanguageProvider";
import { productsText } from "@/lib/text/product";
import { catalogLabel, displayName, productName, searchCatalog, type CatalogItem } from "@/lib/catalog";

// Texts for the edit screen (all four languages)
const editText = {
  en: { title: "Edit item", updated: (n: string) => `${n} updated` },
  hi: { title: "सामान बदलें", updated: (n: string) => `${n} अपडेट हो गया` },
  mr: { title: "माल बदला", updated: (n: string) => `${n} अपडेट झाले` },
  te: { title: "వస్తువు మార్చండి", updated: (n: string) => `${n} అప్‌డేట్ అయింది` },
};

type Product = {
  _id: string;
  name: string;
  unit: string;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockLimit: number;
  expiryDate?: string;
  icon?: string;
  brand?: string;
  names?: Record<string, string>;
};
type Sheet =
  | { kind: "add" }
  | { kind: "stock"; p: Product }
  | { kind: "edit"; p: Product }
  | { kind: "delete"; p: Product }
  | null;

const empty = { name: "", unit: "kg", price: "", stock: "", lowStockLimit: "5", costPrice: "", expiryDate: "" };
const emptyEdit = { unit: "kg", price: "", costPrice: "", lowStockLimit: "5", expiryDate: "" };
const input = "w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-lg outline-none focus:border-leaf";
const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

export default function ProductsPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const s = productsText[lang];
  const et = editText[lang as keyof typeof editText] || editText.en;
  const unit = (u: string) => s.units[u] || u;

  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(empty);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [picked, setPicked] = useState<CatalogItem | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [supplier, setSupplier] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");
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
    const res = await api(`/api/products?search=${encodeURIComponent(search)}`);
    if (res?.ok) setProducts((await res.json()).products);
    setLoaded(true);
  }, [api, search]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  function open(sh: Sheet) {
    setSheet(sh);
    setQty("");
    setCost("");
    setSupplier("");
    setExpiry("");
    setError("");
    setPicked(null);
    if (sh?.kind === "add") setForm(empty);
    if (sh?.kind === "edit") {
      const p = sh.p;
      setEditForm({
        unit: p.unit,
        price: String(p.price),
        costPrice: p.costPrice ? String(p.costPrice) : "",
        lowStockLimit: String(p.lowStockLimit),
        expiryDate: p.expiryDate ? p.expiryDate.slice(0, 10) : "",
      });
    }
  }

  function pick(item: CatalogItem) {
    setPicked(item);
    setForm({ ...form, name: productName(item), unit: item.unit });
  }

  async function addProduct() {
    setError("");
    const extra = picked
      ? {
          brand: picked.brand ?? "",
          icon: picked.icon,
          keys: picked.aka ?? "",
          names: {
            en: productName(picked),
            hi: catalogLabel(picked, "hi"),
            mr: catalogLabel(picked, "mr"),
            te: catalogLabel(picked, "te"),
          },
        }
      : {};
    const res = await api("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        unit: form.unit,
        price: Number(form.price),
        stock: Number(form.stock),
        lowStockLimit: Number(form.lowStockLimit),
        ...(form.costPrice ? { costPrice: Number(form.costPrice) } : {}),
        ...(form.expiryDate ? { expiryDate: form.expiryDate } : {}),
        ...extra,
      }),
    });
    if (!res) return;
    const data = await res.json();
    if (!res.ok) return setError(res.status === 400 ? s.badInput : s.generic);
    setForm(empty);
    setPicked(null);
    setSheet(null);
    setToast(`✅ ${s.added(displayName(data, lang))}`);
    load();
  }

  // Saves changes to an existing item. Stock quantity is NOT changed here:
  // quantity only changes through "Stock arrived" and billing, so records stay correct.
  async function saveEdit(p: Product) {
    setError("");
    const price = Number(editForm.price);
    const costPrice = editForm.costPrice === "" ? 0 : Number(editForm.costPrice);
    const lowStockLimit = Number(editForm.lowStockLimit);
    if (
      editForm.price === "" ||
      editForm.lowStockLimit === "" ||
      !(price >= 0) ||
      !(costPrice >= 0) ||
      !(lowStockLimit >= 0)
    )
      return setError(s.badInput);

    const res = await api(`/api/products/${p._id}`, {
      method: "PUT",
      body: JSON.stringify({
        unit: editForm.unit,
        price,
        costPrice,
        lowStockLimit,
        expiryDate: editForm.expiryDate || null,
      }),
    });
    if (!res) return;
    if (!res.ok) return setError(res.status === 400 ? s.badInput : s.generic);
    setSheet(null);
    setToast(`✅ ${et.updated(displayName(p, lang))}`);
    load();
  }

  async function addStock(p: Product) {
    const n = Number(qty);
    if (!(n > 0)) return setError(s.badQty);
    const res = await api("/api/purchases", {
      method: "POST",
      body: JSON.stringify({
        supplier,
        items: [{ productId: p._id, qty: n, costPrice: cost || 0, expiryDate: expiry || undefined }],
      }),
    });
    if (!res) return;
    if (!res.ok) return setError(res.status === 400 ? s.badQty : s.generic);
    setSheet(null);
    setToast(`✅ ${s.stockAdded(displayName(p, lang), n, unit(p.unit))}`);
    load();
  }

  async function remove(p: Product) {
    await api(`/api/products/${p._id}`, { method: "DELETE" });
    setSheet(null);
    setToast(`🗑 ${s.removed(displayName(p, lang))}`);
    load();
  }

  const suggestions = sheet?.kind === "add" && !picked ? searchCatalog(form.name) : [];

  const title =
    sheet?.kind === "add"
      ? s.addTitle
      : sheet?.kind === "stock"
      ? s.stockTitle(displayName(sheet.p, lang))
      : sheet?.kind === "edit"
      ? et.title
      : sheet?.kind === "delete"
      ? s.deleteTitle
      : "";

  const label = "mb-1 block text-sm font-semibold text-gray-600";

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-4 pb-28">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-leaf-dark">📦 {s.title}</h1>
        <Link href="/dashboard" className="rounded-full bg-white px-4 py-2 font-semibold shadow-sm">
          {t("back")}
        </Link>
      </div>

      <input className={input} placeholder={`🔍 ${s.search}`} value={search} onChange={(e) => setSearch(e.target.value)} />

      <button onClick={() => open({ kind: "add" })} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white shadow active:scale-95">
        ➕ {s.addNew}
      </button>

      {loaded && products.length === 0 && (
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <p className="text-5xl">📦</p>
          <p className="mt-2 font-semibold">{s.noItems}</p>
        </div>
      )}

      {products.map((p) => {
        const out = p.stock === 0;
        const low = p.stock <= p.lowStockLimit;
        const bar = out ? "border-red-500" : low ? "border-turmeric" : "border-leaf";
        const status = out ? `🔴 ${s.out}` : low ? `🟡 ${s.low}` : `🟢 ${s.ok}`;

        let expiryText = "";
        let expiryStyle = "";
        if (p.expiryDate) {
          const d = daysLeft(p.expiryDate);
          if (d < 0) {
            expiryText = s.expired;
            expiryStyle = "bg-red-100 text-red-700";
          } else if (d === 0) {
            expiryText = s.expiresToday;
            expiryStyle = "bg-red-100 text-red-700";
          } else {
            expiryText = s.expiresIn(d);
            expiryStyle = d <= 7 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600";
          }
        }

        return (
          <div key={p._id} className={`rounded-3xl border-l-8 bg-white p-4 shadow-sm ${bar}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-3xl">
                {p.icon || "🛒"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xl font-bold">{displayName(p, lang)}</p>
                <p className="text-gray-500">₹{p.price} / {unit(p.unit)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{p.stock} <span className="text-base font-normal">{unit(p.unit)}</span></p>
                <p className="text-sm font-semibold">{status}</p>
              </div>
            </div>
            {expiryText && (
              <p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${expiryStyle}`}>⏳ {expiryText}</p>
            )}
            <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
              <button onClick={() => open({ kind: "stock", p })} className="rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800 active:scale-95">
                ➕ {s.arrived}
              </button>
              <button onClick={() => open({ kind: "edit", p })} aria-label={et.title} className="rounded-2xl bg-amber-50 px-4 font-semibold text-amber-800 active:scale-95">
                ✏️
              </button>
              <button onClick={() => open({ kind: "delete", p })} className="rounded-2xl bg-red-50 px-4 font-semibold text-red-600 active:scale-95">
                🗑
              </button>
            </div>
          </div>
        );
      })}

      <Modal open={!!sheet} onClose={() => setSheet(null)} title={title}>
        {sheet?.kind === "add" && (
          <div className="space-y-3">
            <input
              className={input}
              placeholder={s.name}
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setPicked(null);
              }}
            />

            {!picked && <p className="text-sm text-gray-500">{s.pickHint}</p>}

            {suggestions.length > 0 && (
              <div className="max-h-56 overflow-y-auto rounded-2xl border-2 border-gray-100 bg-white">
                {suggestions.map((item) => (
                  <button
                    key={`${item.brand ?? ""}-${item.en}`}
                    onClick={() => pick(item)}
                    className="flex w-full items-center gap-3 border-b border-gray-100 p-3 text-left last:border-0"
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <span>
                      <span className="block font-semibold">{catalogLabel(item, lang)}</span>
                      {lang !== "en" && <span className="block text-sm text-gray-500">{productName(item)}</span>}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {picked && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
                <span className="text-3xl">{picked.icon}</span>
                <span className="flex-1 font-semibold text-emerald-900">{catalogLabel(picked, lang)}</span>
                <button onClick={() => setPicked(null)} className="rounded-full bg-white px-3 py-1 text-sm font-semibold">
                  ✕
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <select className={input} value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {Object.keys(s.units).map((u) => (
                  <option key={u} value={u}>{s.units[u]}</option>
                ))}
              </select>
              <input className={input} type="number" inputMode="numeric" placeholder={s.price} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className={input} type="number" inputMode="numeric" placeholder={s.stockQty} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              <input className={input} type="number" inputMode="numeric" placeholder={s.lowLimit} value={form.lowStockLimit} onChange={(e) => setForm({ ...form, lowStockLimit: e.target.value })} />
            </div>
            <input className={input} type="number" inputMode="numeric" placeholder={s.costPrice} value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} />
            <div>
              <label className={label}>{s.expiryLabel}</label>
              <input className={input} type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            {error && <p className="rounded-xl bg-red-50 p-3 font-semibold text-red-600">{error}</p>}
            <button onClick={addProduct} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white active:scale-95">
              ✅ {s.save}
            </button>
          </div>
        )}

        {sheet?.kind === "edit" && (
          <div className="space-y-3">
            <p className="text-lg font-bold">{displayName(sheet.p, lang)}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>&nbsp;</label>
                <select className={input} value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}>
                  {Object.keys(s.units).map((u) => (
                    <option key={u} value={u}>{s.units[u]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={label}>{s.price}</label>
                <input className={input} type="number" inputMode="decimal" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>{s.costPrice}</label>
                <input className={input} type="number" inputMode="decimal" value={editForm.costPrice} onChange={(e) => setEditForm({ ...editForm, costPrice: e.target.value })} />
              </div>
              <div>
                <label className={label}>{s.lowLimit}</label>
                <input className={input} type="number" inputMode="numeric" value={editForm.lowStockLimit} onChange={(e) => setEditForm({ ...editForm, lowStockLimit: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={label}>{s.expiryLabel}</label>
              <input className={input} type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} />
            </div>
            {error && <p className="rounded-xl bg-red-50 p-3 font-semibold text-red-600">{error}</p>}
            <button onClick={() => saveEdit(sheet.p)} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white active:scale-95">
              ✅ {s.save}
            </button>
          </div>
        )}

        {sheet?.kind === "stock" && (
          <div className="space-y-4">
            <p className="text-gray-600">{s.current}: <span className="font-bold">{sheet.p.stock} {unit(sheet.p.unit)}</span></p>
            <input autoFocus type="number" inputMode="numeric" placeholder={s.howMany(unit(sheet.p.unit))} value={qty} onChange={(e) => { setQty(e.target.value); setError(""); }} className="w-full rounded-2xl border-2 border-gray-200 p-4 text-3xl font-bold outline-none focus:border-leaf" />
            <div className="flex gap-2">
              {[5, 10, 25, 50].map((v) => (
                <button key={v} onClick={() => setQty(String(v))} className="rounded-full bg-amber-50 px-4 py-2 font-semibold text-amber-800">
                  +{v}
                </button>
              ))}
            </div>
            <input className={input} type="number" inputMode="numeric" placeholder={s.costPrice} value={cost} onChange={(e) => setCost(e.target.value)} />
            <input className={input} placeholder={s.supplier} value={supplier} onChange={(e) => setSupplier(e.target.value)} />
            <div>
              <label className={label}>{s.expiryLabel}</label>
              <input className={input} type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
            {error && <p className="rounded-xl bg-red-50 p-3 font-semibold text-red-600">{error}</p>}
            <button onClick={() => addStock(sheet.p)} className="w-full rounded-2xl bg-leaf p-4 text-xl font-bold text-white active:scale-95">
              ✅ {s.addStock}
            </button>
          </div>
        )}

        {sheet?.kind === "delete" && (
          <div className="space-y-4">
            <p className="text-lg">{s.deleteAsk(displayName(sheet.p, lang))}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setSheet(null)} className="rounded-2xl bg-gray-100 p-4 font-bold">{s.no}</button>
              <button onClick={() => remove(sheet.p)} className="rounded-2xl bg-red-600 p-4 font-bold text-white">{s.yesDelete}</button>
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