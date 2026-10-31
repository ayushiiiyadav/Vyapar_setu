"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The home address (/) just sends people to the right place:
// logged in -> dashboard, otherwise -> login.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    let token: string | null = null;
    try {
      token = localStorage.getItem("token");
    } catch {}
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return <p className="p-10 text-center text-gray-500">Vyapar Setu…</p>;
}