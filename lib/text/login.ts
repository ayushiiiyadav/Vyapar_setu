import type { LangCode } from "@/lib/languages";

type LoginText = {
  title: string; login: string; signup: string;
  name: string; shop: string; email: string; password: string;
  submitLogin: string; submitSignup: string; wait: string;
  toSignup: string; toLogin: string;
  invalid: string; emailTaken: string; fillAll: string; generic: string; network: string;
};

export const loginText: Record<LangCode, LoginText> = {
  hi: {
    title: "व्यापार सेतु", login: "लॉगिन करें", signup: "नया खाता बनाएं",
    name: "आपका नाम", shop: "दुकान का नाम", email: "ईमेल", password: "पासवर्ड",
    submitLogin: "लॉगिन", submitSignup: "खाता बनाएं", wait: "रुकिए...",
    toSignup: "नया खाता बनाना है? यहाँ दबाएं", toLogin: "पहले से खाता है? लॉगिन करें",
    invalid: "ईमेल या पासवर्ड गलत है", emailTaken: "यह ईमेल पहले से इस्तेमाल में है",
    fillAll: "सारी जानकारी भरें", generic: "कुछ गलत हुआ", network: "सर्वर से कनेक्ट नहीं हो पाया",
  },
  en: {
    title: "Vyapar Setu", login: "Log in", signup: "Create an account",
    name: "Your name", shop: "Shop name", email: "Email", password: "Password",
    submitLogin: "Log in", submitSignup: "Create account", wait: "Please wait...",
    toSignup: "New here? Create an account", toLogin: "Already have an account? Log in",
    invalid: "Wrong email or password", emailTaken: "This email is already registered",
    fillAll: "Please fill in all the fields", generic: "Something went wrong", network: "Could not reach the server",
  },
  mr: {
    title: "व्यापार सेतू", login: "लॉगिन करा", signup: "नवीन खाते उघडा",
    name: "तुमचे नाव", shop: "दुकानाचे नाव", email: "ईमेल", password: "पासवर्ड",
    submitLogin: "लॉगिन", submitSignup: "खाते उघडा", wait: "थांबा...",
    toSignup: "नवीन आहात? येथे खाते उघडा", toLogin: "आधीच खाते आहे? लॉगिन करा",
    invalid: "ईमेल किंवा पासवर्ड चुकीचा आहे", emailTaken: "हा ईमेल आधीच वापरात आहे",
    fillAll: "सर्व माहिती भरा", generic: "काहीतरी चुकले", network: "सर्व्हरशी जोडता आले नाही",
  },
  te: {
    title: "వ్యాపార్ సేతు", login: "లాగిన్ అవ్వండి", signup: "కొత్త ఖాతా తెరవండి",
    name: "మీ పేరు", shop: "దుకాణం పేరు", email: "ఈమెయిల్", password: "పాస్‌వర్డ్",
    submitLogin: "లాగిన్", submitSignup: "ఖాతా తెరవండి", wait: "ఆగండి...",
    toSignup: "కొత్తవారా? ఇక్కడ ఖాతా తెరవండి", toLogin: "ఖాతా ఉందా? లాగిన్ అవ్వండి",
    invalid: "ఈమెయిల్ లేదా పాస్‌వర్డ్ తప్పు", emailTaken: "ఈ ఈమెయిల్ ఇప్పటికే వాడబడింది",
    fillAll: "అన్ని వివరాలు నింపండి", generic: "ఏదో తప్పు జరిగింది", network: "సర్వర్‌కి కనెక్ట్ కాలేదు",
  },
};