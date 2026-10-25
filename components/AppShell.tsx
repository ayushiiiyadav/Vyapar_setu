"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "@/components/LanguageProvider";
import { SHELL } from "@/lib/text/shell";

const items = [
  { href: "/dashboard", icon: "🏠", key: "navHome" },
  { href: "/billing", icon: "🧾", key: "navBill" },
  { href: "/products", icon: "📦", key: "navStock" },
  { href: "/udhaar", icon: "📒", key: "navUdhaar" },
  { href: "/reports", icon: "📊", key: "navReports" },
  { href: "/settings", icon: "⚙️", key: "settings" },
  { href: "/feedback", icon: "🛟", key: "reportIssue" },
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { lang } = useLang();
  const [shop, setShop] = useState("");

  useEffect(() => {
    const u = localStorage.getItem("user");
    setShop(u ? JSON.parse(u).shopName || "" : "");
  }, [path]);

  if (path === "/" || path.startsWith("/login")) return <>{children}</>;

  const s = SHELL[lang];
  const en = SHELL.en;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-linear-to-b from-leaf-dark to-[#0c3b29] p-4 text-white lg:flex">
        <div className="mb-6 flex items-center gap-3 px-2 pt-2">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-2xl">🌾</span>
          <div>
            <p className="text-lg font-bold leading-tight">Vyapar Setu</p>
            <p className="text-xs opacity-70">व्यापार सेतु</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {items.map((i) => {
            const active = path.startsWith(i.href);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  active ? "bg-white/15 shadow-inner" : "hover:bg-white/10"
                }`}
              >
                {active && <span className="absolute left-0 top-2 bottom-2 w-1 rounded-full bg-turmeric" />}
                <span className="text-xl">{i.icon}</span>
                <span className="leading-tight">
                  <span className={`block ${active ? "font-bold" : "font-medium"}`}>{s[i.key]}</span>
                  {lang !== "en" && <span className="block text-xs opacity-60">{en[i.key]}</span>}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl bg-white/10 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-turmeric text-lg font-bold text-leaf-dark">
              {(shop || "V").charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{shop || "Vyapar Setu"}</p>
              <p className="text-xs opacity-70">● online</p>
            </div>
          </div>
          <button onClick={logout} className="mt-3 w-full rounded-xl bg-white/10 py-2 text-sm font-semibold hover:bg-white/20">
            🚪 {s.logout}
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">{children}</div>
    </>
  );
}