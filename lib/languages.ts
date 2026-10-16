export const LANGS = {
  hi: { name: "हिंदी", short: "हिं", english: "Hindi", whisper: "hi" },
  en: { name: "English", short: "EN", english: "English", whisper: "en" },
  mr: { name: "मराठी", short: "मरा", english: "Marathi", whisper: "mr" },
  te: { name: "తెలుగు", short: "తె", english: "Telugu", whisper: "te" },
} as const;

export type LangCode = keyof typeof LANGS;

export const isLang = (x: unknown): x is LangCode =>
  typeof x === "string" && x in LANGS;

// Text shown and spoken by the assistant widget itself
export const UI: Record<
  LangCode,
  {
    listening: string; thinking: string; heard: string; replay: string;
    mic: string; unclear: string; network: string; retry: string;
    noVoice: string; switched: string;
  }
> = {
  hi: {
    listening: "🎙️ सुन रहा हूँ... बोलकर फिर से बटन दबाइए",
    thinking: "⏳ समझ रहा हूँ...",
    heard: "आपने कहा",
    replay: "🔊 फिर से सुनें",
    mic: "माइक की अनुमति दीजिए।",
    unclear: "आवाज़ साफ़ नहीं आई। फिर से बोलिए।",
    network: "इंटरनेट में दिक्कत है। फिर से कोशिश कीजिए।",
    retry: "माफ़ कीजिए, फिर से बोलिए।",
    noVoice: "आवाज़ अभी उपलब्ध नहीं है, कृपया ऊपर लिखा जवाब पढ़ें।",
    switched: "ठीक है, अब मैं हिंदी में बात करूँगा।",
  },
  en: {
    listening: "🎙️ Listening... speak, then tap the button again",
    thinking: "⏳ Thinking...",
    heard: "You said",
    replay: "🔊 Listen again",
    mic: "Please allow the microphone.",
    unclear: "I couldn't hear that clearly. Please say it again.",
    network: "There is a connection problem. Please try again.",
    retry: "Sorry, please say that again.",
    noVoice: "Voice is not available right now, please read the reply above.",
    switched: "Okay, I will speak in English now.",
  },
  mr: {
    listening: "🎙️ ऐकत आहे... बोला, मग बटण पुन्हा दाबा",
    thinking: "⏳ समजून घेत आहे...",
    heard: "तुम्ही म्हणालात",
    replay: "🔊 पुन्हा ऐका",
    mic: "कृपया मायक्रोफोनची परवानगी द्या.",
    unclear: "आवाज नीट आला नाही. कृपया पुन्हा बोला.",
    network: "इंटरनेटमध्ये अडचण आहे. पुन्हा प्रयत्न करा.",
    retry: "माफ करा, कृपया पुन्हा बोला.",
    noVoice: "आवाज सध्या उपलब्ध नाही, कृपया वर लिहिलेले उत्तर वाचा.",
    switched: "ठीक आहे, आता मी मराठीत बोलेन.",
  },
  te: {
    listening: "🎙️ వింటున్నాను... మాట్లాడి, బటన్ మళ్లీ నొక్కండి",
    thinking: "⏳ అర్థం చేసుకుంటున్నాను...",
    heard: "మీరు చెప్పింది",
    replay: "🔊 మళ్లీ వినండి",
    mic: "దయచేసి మైక్రోఫోన్ అనుమతి ఇవ్వండి.",
    unclear: "శబ్దం స్పష్టంగా రాలేదు. దయచేసి మళ్లీ చెప్పండి.",
    network: "ఇంటర్నెట్‌లో సమస్య ఉంది. మళ్లీ ప్రయత్నించండి.",
    retry: "క్షమించండి, దయచేసి మళ్లీ చెప్పండి.",
    noVoice: "ప్రస్తుతం ఆడియో అందుబాటులో లేదు, దయచేసి పైన రాసిన సమాధానం చదవండి.",
    switched: "సరే, ఇప్పుడు నేను తెలుగులో మాట్లాడతాను.",
  },
};