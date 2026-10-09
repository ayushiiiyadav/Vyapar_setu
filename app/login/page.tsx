"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", shopName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) => setForm({ ...form, [k]: v });

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kuch galat hua");
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      }
    } catch {
      setError("Server se connect nahi ho paya");
    }
    setLoading(false);
  }

  const input = "w-full rounded-xl border-2 border-gray-300 p-4 text-lg outline-none focus:border-green-600";

  return (
    <main className="flex min-h-screen items-center justify-center bg-green-50 p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-green-700">व्यापार सेतु</h1>
        <p className="text-center text-gray-600">
          {isSignup ? "नया खाता बनाएं (Sign up)" : "लॉगिन करें (Login)"}
        </p>

        {isSignup && (
          <>
            <input className={input} placeholder="आपका नाम (Your name)" value={form.name} onChange={(e) => update("name", e.target.value)} />
            <input className={input} placeholder="दुकान का नाम (Shop name)" value={form.shopName} onChange={(e) => update("shopName", e.target.value)} />
          </>
        )}
        <input className={input} type="email" placeholder="ईमेल (Email)" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <input className={input} type="password" placeholder="पासवर्ड (Password)" value={form.password} onChange={(e) => update("password", e.target.value)} />

        {error && <p className="rounded-lg bg-red-50 p-3 text-red-600">{error}</p>}

        <button onClick={submit} disabled={loading} className="w-full rounded-xl bg-green-600 p-4 text-xl font-semibold text-white disabled:opacity-60">
          {loading ? "रुकिए..." : isSignup ? "खाता बनाएं" : "लॉगिन"}
        </button>

        <button onClick={() => { setIsSignup(!isSignup); setError(""); }} className="w-full text-green-700 underline">
          {isSignup ? "पहले से खाता है? लॉगिन करें" : "नया खाता बनाना है? यहाँ दबाएं"}
        </button>
      </div>
    </main>
  );
}