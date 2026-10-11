"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type State = "idle" | "listening" | "thinking";

export default function VoiceAssistant() {
  const path = usePathname();
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [noVoice, setNoVoice] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioEl = useRef<HTMLAudioElement | null>(null);
  const lastAudio = useRef("");
  const voices = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => (voices.current = window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  if (path === "/" || path.startsWith("/login")) return null;

  function stopAudio() {
    audioEl.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  // Fallback only: the device's own voice
  function browserSpeak(text: string) {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const list = voices.current.length ? voices.current : synth.getVoices();
    const hi = list.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("hi"));
    setNoVoice(!hi);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "hi-IN";
    if (hi) u.voice = hi;
    u.rate = 0.9;
    synth.speak(u);
  }

  // Main voice: server-generated audio that plays on any device
  async function speak(text: string, replay = false) {
    stopAudio();
    setNoVoice(false);
    if (!replay) lastAudio.current = "";
    try {
      if (!lastAudio.current) {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/assistant/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("tts");
        const { audio } = await res.json();
        lastAudio.current = `data:audio/mpeg;base64,${audio}`;
      }
      if (!audioEl.current) audioEl.current = new Audio();
      audioEl.current.src = lastAudio.current;
      await audioEl.current.play();
    } catch {
      browserSpeak(text);
    }
  }

  function say(text: string) {
    setReply(text);
    speak(text);
  }

  async function start() {
    setReply("");
    setHeard("");
    stopAudio();
    if (!audioEl.current) audioEl.current = new Audio(); // created on tap so browsers allow playback later
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
      if (ad.navigate) setTimeout(() => router.push(ad.navigate), 2500);
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
              {noVoice && (
                <p className="mt-2 rounded-xl bg-amber-50 p-2 text-sm text-amber-800">
                  आवाज़ अभी उपलब्ध नहीं है, कृपया ऊपर लिखा जवाब पढ़ें।
                </p>
              )}
              <div className="mt-3 flex gap-2">
                <button onClick={() => speak(reply, true)} className="flex-1 rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800">
                  🔊 फिर से सुनें
                </button>
                <button onClick={() => { setReply(""); setHeard(""); stopAudio(); }} className="rounded-2xl bg-gray-100 px-5 font-semibold">
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