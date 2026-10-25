"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import { SHELL } from "@/lib/text/shell";

const items = [
  { href: "/dashboard", icon: "🏠", key: "navHome" },
  { href: "/billing", icon: "🧾", key: "navBill" },
  { href: "/products", icon: "📦", key: "navStock" },
  { href: "/udhaar", icon: "📒", key: "navUdhaar" },
  { href: "/reports", icon: "📊", key: "navReports" },
] as const;

export default function BottomNav() {
  const path = usePathname();
  const { lang } = useLang();

  if (path === "/" || path.startsWith("/login")) return null;

  return (
   <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-100 bg-white/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-2xl">
        {items.map((i) => {
          const active = path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={`flex flex-1 flex-col items-center py-2 ${active ? "text-leaf-dark" : "text-gray-500"}`}>
              <span className={`rounded-full px-4 py-1 text-2xl ${active ? "bg-emerald-100" : ""}`}>{i.icon}</span>
              <span className={`text-xs ${active ? "font-bold" : ""}`}>{SHELL[lang][i.key]}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}