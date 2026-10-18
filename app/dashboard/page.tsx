"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/components/LanguageProvider";
import type { TKey } from "@/lib/i18n";

type Product = {
  _id: string;
  name: string;
  stock: number;
  lowStockLimit: number;
  expiryDate?: string;
};

const TILES: { href: string; icon: string; label: TKey; sub: string; color: string }[] = [
  { href: "/billing", icon: "🧾", label: "tileBilling", sub: "Billing", color: "bg-green-600" },
  { href: "/products", icon: "📦", label: "tileStock", sub: "Stock", color: "bg-blue-600" },
  { href: "/udhaar", icon: "📒", label: "tileUdhaar", sub: "Udhaar", color: "bg-orange-500" },
  { href: "/reports", icon: "📊", label: "tileReports", sub: "Reports", color: "bg-purple-600" },
];

const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);

export default function Dashboard() {
  const router = useRouter();
  const { lang, t } = useLang();
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
  const soon = products.filter((p) => p.expiryDate && daysLeft(p.expiryDate) <= 7).length;

  return (
    <main className="mx-auto max-w-2xl space-y-5 p-4 pb-28">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500">{t("greeting")}</p>
          <h1 className="text-2xl font-bold text-green-700">{shop || t("appName")}</h1>
        </div>
        <button onClick={logout} className="rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-700">
          {t("logout")}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-yellow-50 p-3 text-center">
          <p className="text-3xl font-bold text-yellow-600">{low}</p>
          <p className="text-sm font-semibold">🟡 {t("lowStock")}</p>
        </div>
        <div className="rounded-2xl bg-red-50 p-3 text-center">
          <p className="text-3xl font-bold text-red-600">{out}</p>
          <p className="text-sm font-semibold">🔴 {t("outOfStock")}</p>
        </div>
        <div className="rounded-2xl bg-orange-50 p-3 text-center">
          <p className="text-3xl font-bold text-orange-600">{soon}</p>
          <p className="text-sm font-semibold">⏳ {t("expiringSoon")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {TILES.map((tile) => (
          <Link key={tile.href} href={tile.href} className={`${tile.color} flex flex-col items-center justify-center rounded-2xl p-6 text-center text-white shadow`}>
            <span className="text-5xl">{tile.icon}</span>
            <span className="mt-2 text-xl font-bold">{t(tile.label)}</span>
            {lang !== "en" && <span className="text-sm opacity-80">{tile.sub}</span>}
          </Link>
        ))}
      </div>
    </main>
  );
}