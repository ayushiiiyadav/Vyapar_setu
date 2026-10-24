"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LANGS, UI, type LangCode } from "@/lib/languages";
import { useLang } from "@/components/LanguageProvider";

type State = "idle" | "listening" | "thinking";

const BCP: Record<LangCode, string> = { hi: "hi-IN", en: "en-IN", mr: "mr-IN", te: "te-IN" };

export default function VoiceAssistant() {
  const path = usePathname();
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [heard, setHeard] = useState("");
  const [reply, setReply] = useState("");
  const [noVoice, setNoVoice] = useState(false);
  const { lang, setLang } = useLang();
  const [picker, setPicker] = useState(false);
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

  const t = UI[lang];

  function stopAudio() {
    audioEl.current?.pause();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }

  // Fallback only: the device's own voice
  function browserSpeak(text: string, l: LangCode) {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const list = voices.current.length ? voices.current : synth.getVoices();
    const match = list.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith(l));
    setNoVoice(!match);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = BCP[l];
    if (match) u.voice = match;
    u.rate = 0.9;
    synth.speak(u);
  }

  // Main voice: server-generated audio that plays on any device
  async function speak(text: string, replay = false, l: LangCode = lang) {
    stopAudio();
    async function speak(text: string, replay = false, l: LangCode = lang) {
    stopAudio();
    if (!replay && localStorage.getItem("voice") === "off") return;
    // ...the rest stays as it is
    setNoVoice(false);
    if (!replay) lastAudio.current = "";
    try {
      if (!lastAudio.current) {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/assistant/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ text, lang: l }),
        });
        if (!res.ok) throw new Error("tts");
        const { audio } = await res.json();
        lastAudio.current = `data:audio/wav;base64,${audio}`;
      }
      if (!audioEl.current) audioEl.current = new Audio();
      audioEl.current.src = lastAudio.current;
      await audioEl.current.play();
    } catch {
      browserSpeak(text, l);
    }
  }

  function say(text: string, l: LangCode = lang) {
    setReply(text);
    speak(text, false, l);
  }

  function chooseLang(l: LangCode) {
    if (!audioEl.current) audioEl.current = new Audio(); // created on tap so playback is allowed
    setLang(l);
    localStorage.setItem("lang", l);
    setPicker(false);
    setHeard("");
    say(UI[l].switched, l);
  }

  async function start() {
    setReply("");
    setHeard("");
    setPicker(false);
    stopAudio();
    if (!audioEl.current) audioEl.current = new Audio();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        send(new Blob(chunks.current, { type: mr.mimeType || "audio/webm" }));
      };
      mr.start();
      recorder.current = mr;
      setState("listening");
      timer.current = setTimeout(stop, 8000);
    } catch {
      setReply(t.mic);
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
      fd.append("lang", lang);
      const tr = await fetch("/api/assistant/transcribe", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (tr.status === 401) {
        setState("idle");
        return router.push("/login");
      }
      const td = await tr.json();
      if (!tr.ok || !td.text?.trim()) {
        say(t.unclear);
        return setState("idle");
      }
      setHeard(td.text);

      const a = await fetch("/api/assistant/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: td.text, lang }),
      });
      const ad = await a.json();
      say(ad.reply || t.retry);
      if (ad.navigate) setTimeout(() => router.push(ad.navigate), 2500);
    } catch {
      say(t.network);
    }
    setState("idle");
  }

  const listening = state === "listening";

  return (
    <>
      {(reply || heard || listening || state === "thinking") && (
        <div className="fixed inset-x-4 bottom-44 z-50 mx-auto max-w-md rounded-3xl bg-white p-4 shadow-2xl">
          {listening && <p className="text-lg font-bold text-red-600">{t.listening}</p>}
          {state === "thinking" && <p className="text-lg font-bold text-leaf-dark">{t.thinking}</p>}
          {heard && <p className="text-sm text-gray-500">{t.heard}: “{heard}”</p>}
          {reply && (
            <>
              <p className="mt-1 text-xl font-bold text-leaf-dark">{reply}</p>
              {noVoice && <p className="mt-2 rounded-xl bg-amber-50 p-2 text-sm text-amber-800">{t.noVoice}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => speak(reply, true)} className="flex-1 rounded-2xl bg-emerald-50 p-3 font-semibold text-emerald-800">
                  {t.replay}
                </button>
                <button onClick={() => { setReply(""); setHeard(""); stopAudio(); }} className="rounded-2xl bg-gray-100 px-5 font-semibold">
                  ✕
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {picker && (
        <div className="fixed bottom-44 right-4 z-60 w-44 space-y-2 rounded-3xl bg-white p-3 shadow-2xl">
          {(Object.keys(LANGS) as LangCode[]).map((code) => (
            <button
              key={code}
              onClick={() => chooseLang(code)}
              className={`w-full rounded-2xl p-3 text-lg font-semibold ${code === lang ? "bg-leaf text-white" : "bg-gray-100"}`}
            >
              {LANGS[code].name}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setPicker(!picker)}
        aria-label="Language"
        className="fixed bottom-26 right-22 z-60 h-12 min-w-12 rounded-full bg-white px-3 text-sm font-bold text-leaf-dark shadow-xl"
      >
        🌐 {LANGS[lang].short}
      </button>

      <button
        onClick={listening ? stop : start}
        disabled={state === "thinking"}
        aria-label="Speak"
        className={`fixed bottom-24 right-4 z-50 flex h-16 w-16 items-center justify-center rounded-full text-3xl shadow-xl active:scale-95 ${
          listening ? "animate-pulse bg-red-500" : "bg-turmeric"
        } disabled:opacity-60`}
      >
        {listening ? "⏹" : "🎤"}
      </button>
    </>
  );
}
}