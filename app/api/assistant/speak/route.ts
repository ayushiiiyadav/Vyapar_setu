import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { synthesize } from "@/lib/gemini";

const cache = new Map<string, string>();

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const text = String(body.text || "").trim().slice(0, 300);
  const lang = String(body.lang || "hi").toLowerCase().replace(/[^a-z]/g, "").slice(0, 3);
  if (!text) return NextResponse.json({ error: "Text khali hai" }, { status: 400 });
  if (!process.env.GEMINI_API_KEY)
    return NextResponse.json({ error: "Voice not configured" }, { status: 501 });

  const voice =
    process.env[`GEMINI_VOICE_${lang.toUpperCase()}`] || process.env.GEMINI_VOICE || "Kore";

  const cacheKey = `${voice}:${text}`;
  const hit = cache.get(cacheKey);
  if (hit) return NextResponse.json({ audio: hit });

  try {
    const audio = await synthesize(text, voice);
    if (!audio) throw new Error("empty audio");
    if (cache.size >= 50) cache.delete(cache.keys().next().value as string);
    cache.set(cacheKey, audio);
    return NextResponse.json({ audio });
  } catch (e) {
    console.error("Voice TTS error:", e);
    return NextResponse.json({ error: "Voice failed" }, { status: 502 });
  }
}