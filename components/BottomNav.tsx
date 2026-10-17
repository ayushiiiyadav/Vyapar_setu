"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import type { TKey } from "@/lib/i18n";

const items: { href: string; icon: string; label: TKey }[] = [
  { href: "/dashboard", icon: "🏠", label: "navHome" },
  { href: "/billing", icon: "🧾", label: "navBill" },
  { href: "/products", icon: "📦", label: "navStock" },
  { href: "/udhaar", icon: "📒", label: "navUdhaar" },
];

export default function BottomNav() {
  const path = usePathname();
  const { t } = useLang();

  if (path === "/" || path.startsWith("/login")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {items.map((i) => {
          const active = path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={`flex flex-1 flex-col items-center py-2 ${active ? "text-leaf-dark" : "text-gray-500"}`}>
              <span className={`rounded-full px-5 py-1 text-2xl ${active ? "bg-emerald-100" : ""}`}>{i.icon}</span>
              <span className={`text-xs ${active ? "font-bold" : ""}`}>{t(i.label)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}