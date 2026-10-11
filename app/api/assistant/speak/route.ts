import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { synthesize } from "@/lib/sarvam";

const cache = new Map<string, string>();

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const text = String(body.text || "").trim().slice(0, 500);
  if (!text) return NextResponse.json({ error: "Text khali hai" }, { status: 400 });
  if (!process.env.SARVAM_API_KEY)
    return NextResponse.json({ error: "Voice not configured" }, { status: 501 });

  const hit = cache.get(text);
  if (hit) return NextResponse.json({ audio: hit });

  try {
    const audio = await synthesize(text);
    if (!audio) throw new Error("empty audio");
    if (cache.size >= 100) cache.delete(cache.keys().next().value as string);
    cache.set(text, audio);
    return NextResponse.json({ audio });
  } catch (e) {
    console.error("Sarvam TTS error:", e);
    return NextResponse.json({ error: "Voice failed" }, { status: 502 });
  }
}