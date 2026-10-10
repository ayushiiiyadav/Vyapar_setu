import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { transcribe } from "@/lib/groq";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("audio");
  if (!(file instanceof File) || file.size === 0)
    return NextResponse.json({ error: "Awaaz nahi mili" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: "Awaaz bahut lambi hai" }, { status: 400 });

  try {
    const text = await transcribe(file);
    return NextResponse.json({ text });
  } catch (e) {
    console.error("Whisper error:", e);
    return NextResponse.json({ error: "Samajh nahi paya" }, { status: 502 });
  }
}