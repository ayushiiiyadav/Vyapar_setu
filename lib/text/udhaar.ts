import type { LangCode } from "@/lib/languages";

type UdhaarText = {
  title: string; totalLabel: string; countLabel: (n: number) => string;
  none: string; noPhone: string; received: string; remind: string;
  sheetTitle: (name: string) => string;
  totalDue: string; amountPh: string; full: (amt: number) => string;
  deposit: string; wait: string;
  errAmount: string; errMore: (bal: number) => string; generic: string;
  toast: (name: string, amt: number) => string;
  reminder: (name: string, shop: string, amt: number) => string;
  defaultShop: string;
};

export const udhaarText: Record<LangCode, UdhaarText> = {
  hi: {
    title: "उधार खाता", totalLabel: "कुल बाकी रकम",
    countLabel: (n) => `${n} ग्राहकों का उधार बाकी`,
    none: "किसी का उधार बाकी नहीं", noPhone: "नंबर नहीं है",
    received: "पैसे मिले", remind: "याद दिलाएं",
    sheetTitle: (n) => `${n} से पैसे मिले`,
    totalDue: "कुल बाकी", amountPh: "₹ कितने मिले?", full: (a) => `पूरा ₹${a}`,
    deposit: "जमा करें", wait: "रुकिए...",
    errAmount: "सही रकम लिखें", errMore: (b) => `बाकी सिर्फ ₹${b} है`, generic: "कुछ गलत हुआ",
    toast: (n, a) => `${n} से ₹${a} जमा हुए`,
    reminder: (n, s, a) => `नमस्ते ${n} जी, ${s} से याद दिलाना है कि आपका ₹${a} बाकी है। कृपया सुविधा से जमा कर दें। धन्यवाद 🙏`,
    defaultShop: "हमारी दुकान",
  },
  en: {
    title: "Udhaar ledger", totalLabel: "Total pending",
    countLabel: (n) => `${n} customers have pending udhaar`,
    none: "Nobody owes you anything", noPhone: "No phone number",
    received: "Money received", remind: "Send reminder",
    sheetTitle: (n) => `Money received from ${n}`,
    totalDue: "Total pending", amountPh: "₹ How much was paid?", full: (a) => `Full ₹${a}`,
    deposit: "Save payment", wait: "Please wait...",
    errAmount: "Enter a valid amount", errMore: (b) => `Only ₹${b} is pending`, generic: "Something went wrong",
    toast: (n, a) => `₹${a} received from ${n}`,
    reminder: (n, s, a) => `Hello ${n}, a gentle reminder from ${s} that ₹${a} is pending on your account. Please pay when convenient. Thank you 🙏`,
    defaultShop: "our shop",
  },
  mr: {
    title: "उधारी खाते", totalLabel: "एकूण बाकी रक्कम",
    countLabel: (n) => `${n} ग्राहकांची उधारी बाकी`,
    none: "कोणाचीही उधारी बाकी नाही", noPhone: "नंबर नाही",
    received: "पैसे मिळाले", remind: "आठवण करा",
    sheetTitle: (n) => `${n} कडून पैसे मिळाले`,
    totalDue: "एकूण बाकी", amountPh: "₹ किती मिळाले?", full: (a) => `पूर्ण ₹${a}`,
    deposit: "जमा करा", wait: "थांबा...",
    errAmount: "योग्य रक्कम लिहा", errMore: (b) => `बाकी फक्त ₹${b} आहे`, generic: "काहीतरी चुकले",
    toast: (n, a) => `${n} कडून ₹${a} जमा झाले`,
    reminder: (n, s, a) => `नमस्कार ${n}, ${s} कडून आठवण करून देत आहोत की तुमचे ₹${a} बाकी आहेत. कृपया सोयीनुसार जमा करा. धन्यवाद 🙏`,
    defaultShop: "आमचे दुकान",
  },
  te: {
    title: "బాకీ ఖాతా", totalLabel: "మొత్తం బాకీ",
    countLabel: (n) => `${n} మంది బాకీ ఉన్నారు`,
    none: "ఎవరికీ బాకీ లేదు", noPhone: "నంబర్ లేదు",
    received: "డబ్బులు వచ్చాయి", remind: "గుర్తు చేయండి",
    sheetTitle: (n) => `${n} నుండి డబ్బులు వచ్చాయి`,
    totalDue: "మొత్తం బాకీ", amountPh: "₹ ఎంత వచ్చాయి?", full: (a) => `పూర్తిగా ₹${a}`,
    deposit: "జమ చేయండి", wait: "ఆగండి...",
    errAmount: "సరైన మొత్తం రాయండి", errMore: (b) => `బాకీ ₹${b} మాత్రమే`, generic: "ఏదో తప్పు జరిగింది",
    toast: (n, a) => `${n} నుండి ₹${a} జమ అయ్యాయి`,
    reminder: (n, s, a) => `నమస్కారం ${n} గారు, ${s} నుండి గుర్తు చేస్తున్నాం, మీరు ₹${a} బాకీ ఉన్నారు. దయచేసి వీలైనప్పుడు చెల్లించండి. ధన్యవాదాలు 🙏`,
    defaultShop: "మా దుకాణం",
  },
};