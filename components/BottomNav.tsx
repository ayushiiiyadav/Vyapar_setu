"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", icon: "🏠", label: "घर" },
  { href: "/billing", icon: "🧾", label: "बिल" },
  { href: "/products", icon: "📦", label: "स्टॉक" },
  { href: "/udhaar", icon: "📒", label: "उधार" },
];

export default function BottomNav() {
  const path = usePathname();
  if (path === "/" || path.startsWith("/login")) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-amber-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl">
        {items.map((i) => {
          const active = path.startsWith(i.href);
          return (
            <Link key={i.href} href={i.href} className={`flex flex-1 flex-col items-center py-2 ${active ? "text-leaf-dark" : "text-gray-500"}`}>
              <span className={`rounded-full px-5 py-1 text-2xl ${active ? "bg-emerald-100" : ""}`}>{i.icon}</span>
              <span className={`text-xs ${active ? "font-bold" : ""}`}>{i.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}