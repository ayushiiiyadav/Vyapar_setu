"use client";
import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type State = "idle" | "listening" | "thinking";

export default function VoiceAssistant() {
  const path = usePathname();
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (path === "/" || path.startsWith("/login")) return null;

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    const v = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (v) u.voice = v;
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function say(text: string) {
    setReply(text);
    speak(text);
  }

  async function start() {
    setReply("");
    setHeard("");
    window.speechSynthesis?.cancel();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        send(new Blob(chunks.current, { type: mr.mimeType || "audio/webm" }));
      };
      mr.start();
      recorder.current = mr;
      setState("listening");
      timer.current = setTimeout(stop, 8000);
    } catch {
      setReply("माइक की अनुमति दीजिए।");
    }
  }

  function stop() {
    if (timer.current) clearTimeout(timer.current);
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  async function send(blob: Blob) {
    setState("thinking");
    const token = localStorage.getItem("token");
    if (!token) {
      setState("idle");
      return router.push("/login");
    }
    try {
      const fd = new FormData();
      fd.append("audio", blob, "voice.webm");
      const t = await fetch("/api/assistant/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (t.status === 401) {
        setState("idle");
        return router.push("/login");
      }
      const td = await t.json();
      if (!t.ok || !td.text?.trim()) {
        say("आवाज़ साफ़ नहीं आई। फिर से बोलिए।");
        return setState("idle");
      }
      setHeard(td.text);

      const a = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: td.text }),
      });
      const ad = await a.json();
      say(ad.reply || "माफ़ कीजिए, फिर से बोलिए।");
      if (ad.navigate) setTimeout(() => router.push(ad.navigate), 1800);
    } catch {
      say("इंटरनेट में दिक्कत है। फिर से कोशिश कीजिए।");
    }
    setState("idle");
  }

  const listening = state === "listening";

  return (
    <>
      {(reply || heard || listening || state === "thinking") && (
        <div className="fixed inset-x-4 bottom-44 z-50 mx-auto max-w-md rounded-3xl bg-white p-4 shadow-2xl">
          {listening && <p className="text-lg font-bold text-red-600">🎙️ सुन रहा हूँ... बोलकर फिर से बटन दबाइए</p>}
          {state === "thinking" && <p className="text-lg font-bold text-leaf-dark">⏳ समझ रहा हूँ...</p>}
          {heard && <p className="text-sm text-gray-500">आपने कहा: “{heard}”</p>}
          {reply && (
            <>
              <p className="mt-1 text-xl font-bold text-leaf-dark">{reply}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => speak(reply)} className="flex-1 rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800">
                  🔊 फिर से सुनें
                </button>
                <button onClick={() => { setReply(""); setHeard(""); window.speechSynthesis?.cancel(); }} className="rounded-2xl bg-gray-100 px-5 font-semibold">
                  ✕
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        onClick={listening ? stop : start}
        disabled={state === "thinking"}
        aria-label="बोलकर पूछें"
        className={`fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-xl active:scale-95 ${
          listening ? "animate-pulse bg-red-500" : "bg-turmeric"
        } disabled:opacity-60`}
      >
        {listening ? "⏹" : "🎤"}
      </button>
    </>
  );
}