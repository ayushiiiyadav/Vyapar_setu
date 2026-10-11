export async function synthesize(text: string): Promise<string> {
  const res = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-subscription-key": process.env.SARVAM_API_KEY as string,
    },
    body: JSON.stringify({
      text,
      language_code: "hi-IN",
      model: "bulbul:v3",
      speaker: process.env.SARVAM_SPEAKER || "ritu",
      pace: 0.95,
      output_audio_codec: "mp3",
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return (data.audios || []).join(""); // base64 audio
}