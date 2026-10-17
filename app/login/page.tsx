"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/components/LanguageProvider";
import LangSwitch from "@/components/LangSwitch";
import { loginText } from "@/lib/text/login";

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useLang();
  const s = loginText[lang];
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
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else if (res.status === 401) setError(s.invalid);
      else if (res.status === 409) setError(s.emailTaken);
      else if (res.status === 400) setError(s.fillAll);
      else setError(s.generic);
    } catch {
      setError(s.network);
    }
    setLoading(false);
  }

  const input =
    "w-full rounded-xl border-2 border-gray-300 p-4 text-lg outline-none focus:border-green-600";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-green-50 p-4">
      <LangSwitch />
      <div className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-green-700">{s.title}</h1>
        <p className="text-center text-gray-600">{isSignup ? s.signup : s.login}</p>

        {isSignup && (
          <>
            <input className={input} placeholder={s.name} value={form.name} onChange={(e) => update("name", e.target.value)} />
            <input className={input} placeholder={s.shop} value={form.shopName} onChange={(e) => update("shopName", e.target.value)} />
          </>
        )}
        <input className={input} type="email" placeholder={s.email} value={form.email} onChange={(e) => update("email", e.target.value)} />
        <input className={input} type="password" placeholder={s.password} value={form.password} onChange={(e) => update("password", e.target.value)} />

        {error && <p className="rounded-lg bg-red-50 p-3 text-red-600">{error}</p>}

        <button onClick={submit} disabled={loading} className="w-full rounded-xl bg-green-600 p-4 text-xl font-semibold text-white disabled:opacity-60">
          {loading ? s.wait : isSignup ? s.submitSignup : s.submitLogin}
        </button>

        <button onClick={() => { setIsSignup(!isSignup); setError(""); }} className="w-full text-green-700 underline">
          {isSignup ? s.toLogin : s.toSignup}
        </button>
      </div>
    </main>
  );
}