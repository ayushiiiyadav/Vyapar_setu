"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Product = { _id: string; name: string; stock: number; lowStockLimit: number };

export default function Dashboard() {
  const router = useRouter();
  const [shop, setShop] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token) return router.push("/login");
    if (user) setShop(JSON.parse(user).shopName);

    fetch("/api/products", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setProducts(d.products));
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const out = products.filter((p) => p.stock === 0).length;
  const low = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockLimit).length;

  const tiles = [
    { href: "/billing", icon: "🧾", label: "बिल बनाएं", sub: "Billing", color: "bg-green-600" },
    { href: "/products", icon: "📦", label: "सामान / स्टॉक", sub: "Stock", color: "bg-blue-600" },
    { href: "/udhaar", icon: "📒", label: "उधार खाता", sub: "Udhaar", color: "bg-orange-500" },
    { href: "/reports", icon: "📊", label: "रिपोर्ट", sub: "Reports", color: "bg-purple-600" },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">नमस्ते 🙏</p>
          <h1 className="text-2xl font-bold text-green-700">{shop || "व्यापार सेतु"}</h1>
        </div>
        <button onClick={logout} className="rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-700">
          बाहर निकलें
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-yellow-50 p-4 text-center">
          <p className="text-3xl font-bold text-yellow-600">{low}</p>
          <p className="font-semibold">🟡 कम स्टॉक</p>
        </div>
        <div className="rounded-2xl bg-red-50 p-4 text-center">
          <p className="text-3xl font-bold text-red-600">{out}</p>
          <p className="font-semibold">🔴 खत्म</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={`${t.color} flex flex-col items-center justify-center rounded-2xl p-6 text-white shadow`}>
            <span className="text-5xl">{t.icon}</span>
            <span className="mt-2 text-xl font-bold">{t.label}</span>
            <span className="text-sm opacity-80">{t.sub}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}