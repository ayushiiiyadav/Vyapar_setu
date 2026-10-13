const MODELS = [
  process.env.GEMINI_TTS_MODEL,
  "gemini-3.8-flash-lite-tts",
  "gemini-3.8-flash-tts",
].filter(Boolean) as string[];

export async function synthesize(text: string, voice: string): Promise<string> {
  let lastError = "";
  for (const model of MODELS) {
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.GEMINI_API_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [{ type: "user_input", content: [{ type: "text", text }] }],
        response_format: { type: "audio" },
        generation_config: { speech_config: [{ voice }] },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const audio = (data.steps || [])
        .flatMap((s: any) => s.content || [])
        .filter((c: any) => c.type === "audio" && c.data);
      const last = audio[audio.length - 1];
      if (last) return last.data as string; // base64 WAV
      lastError = "no audio in response";
    } else {
      lastError = await res.text();
    }
    console.error(`Gemini TTS model ${model} failed:`, lastError);
  }
  throw new Error(lastError);
}