const BASE = "https://api.groq.com/openai/v1";
const key = () => process.env.GROQ_API_KEY as string;

export async function transcribe(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file, file.name || "voice.webm");
  fd.append("model", "whisper-large-v3");
  fd.append("language", "hi");
  fd.append("temperature", "0");

  const res = await fetch(`${BASE}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key()}` },
    body: fd,
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.text || "";
}

const CHAT_MODELS = [
  process.env.GROQ_CHAT_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
].filter(Boolean) as string[];

export async function chatJSON(system: string, user: string) {
  let lastError = "";
  for (const model of CHAT_MODELS) {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return JSON.parse(data.choices[0].message.content);
    }
    lastError = await res.text();
    console.error(`Groq model ${model} failed:`, lastError);
  }
  throw new Error(lastError);
}