import type { LangCode } from "@/lib/languages";

type ReportsText = {
  title: string; wait: string; generic: string;
  todaySales: string; bills: (n: number) => string;
  last7: string; last30: string; dailyTitle: string;
  cash30: string; credit30: string;
  topTitle: string; noSales: string; sold: (qty: number, rev: number) => string;
  slowTitle: string; noneGood: string; lying: (stock: number, unit: string) => string;
  lowTitle: string; allFine: string; out: string;
  udhaarPending: string;
  days: Record<string, string>;
  units: Record<string, string>;
};

export const reportsText: Record<LangCode, ReportsText> = {
  hi: {
    title: "रिपोर्ट", wait: "रुकिए...", generic: "कुछ गलत हुआ",
    todaySales: "आज की बिक्री", bills: (n) => `${n} बिल`,
    last7: "पिछले 7 दिन", last30: "पिछले 30 दिन", dailyTitle: "रोज़ की बिक्री (7 दिन)",
    cash30: "नकद (30 दिन)", credit30: "उधार (30 दिन)",
    topTitle: "सबसे ज़्यादा बिकने वाला (30 दिन)", noSales: "अभी कोई बिक्री नहीं",
    sold: (q, r) => `${q} बिके · ₹${r}`,
    slowTitle: "धीमा बिकने वाला (14 दिन में नहीं बिका)", noneGood: "कोई नहीं 👍",
    lying: (s, u) => `${s} ${u} पड़ा है`,
    lowTitle: "कम / खत्म स्टॉक", allFine: "सब ठीक है 👍", out: "खत्म",
    udhaarPending: "कुल उधार बाकी",
    days: { Mon: "सोम", Tue: "मंगल", Wed: "बुध", Thu: "गुरु", Fri: "शुक्र", Sat: "शनि", Sun: "रवि" },
    units: { kg: "किलो", litre: "लीटर", pcs: "पीस", packet: "पैकेट" },
  },
  en: {
    title: "Reports", wait: "Please wait...", generic: "Something went wrong",
    todaySales: "Today's sales", bills: (n) => `${n} bills`,
    last7: "Last 7 days", last30: "Last 30 days", dailyTitle: "Daily sales (7 days)",
    cash30: "Cash (30 days)", credit30: "Udhaar (30 days)",
    topTitle: "Best sellers (30 days)", noSales: "No sales yet",
    sold: (q, r) => `${q} sold · ₹${r}`,
    slowTitle: "Slow movers (not sold in 14 days)", noneGood: "None 👍",
    lying: (s, u) => `${s} ${u} in stock`,
    lowTitle: "Low / out of stock", allFine: "All good 👍", out: "Out",
    udhaarPending: "Total udhaar pending",
    days: { Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun" },
    units: { kg: "kg", litre: "litre", pcs: "pcs", packet: "packet" },
  },
  mr: {
    title: "अहवाल", wait: "थांबा...", generic: "काहीतरी चुकले",
    todaySales: "आजची विक्री", bills: (n) => `${n} बिले`,
    last7: "मागील 7 दिवस", last30: "मागील 30 दिवस", dailyTitle: "रोजची विक्री (7 दिवस)",
    cash30: "रोख (30 दिवस)", credit30: "उधार (30 दिवस)",
    topTitle: "सर्वाधिक विकला जाणारा माल (30 दिवस)", noSales: "अजून विक्री नाही",
    sold: (q, r) => `${q} विकले · ₹${r}`,
    slowTitle: "हळू विकला जाणारा माल (14 दिवसांत विकला नाही)", noneGood: "कोणताही नाही 👍",
    lying: (s, u) => `${s} ${u} पडून आहे`,
    lowTitle: "कमी / संपलेला साठा", allFine: "सर्व ठीक आहे 👍", out: "संपले",
    udhaarPending: "एकूण उधारी बाकी",
    days: { Mon: "सोम", Tue: "मंगळ", Wed: "बुध", Thu: "गुरु", Fri: "शुक्र", Sat: "शनि", Sun: "रवि" },
    units: { kg: "किलो", litre: "लिटर", pcs: "नग", packet: "पॅकेट" },
  },
  te: {
    title: "రిపోర్టులు", wait: "ఆగండి...", generic: "ఏదో తప్పు జరిగింది",
    todaySales: "ఈ రోజు అమ్మకాలు", bills: (n) => `${n} బిల్లులు`,
    last7: "గత 7 రోజులు", last30: "గత 30 రోజులు", dailyTitle: "రోజువారీ అమ్మకాలు (7 రోజులు)",
    cash30: "నగదు (30 రోజులు)", credit30: "బాకీ (30 రోజులు)",
    topTitle: "ఎక్కువగా అమ్ముడైనవి (30 రోజులు)", noSales: "ఇంకా అమ్మకాలు లేవు",
    sold: (q, r) => `${q} అమ్ముడయ్యాయి · ₹${r}`,
    slowTitle: "నెమ్మదిగా అమ్ముడయ్యేవి (14 రోజుల్లో అమ్మలేదు)", noneGood: "ఏవీ లేవు 👍",
    lying: (s, u) => `${s} ${u} మిగిలి ఉన్నాయి`,
    lowTitle: "తక్కువ / అయిపోయిన స్టాక్", allFine: "అంతా బాగుంది 👍", out: "అయిపోయింది",
    udhaarPending: "మొత్తం బాకీ",
    days: { Mon: "సోమ", Tue: "మంగళ", Wed: "బుధ", Thu: "గురు", Fri: "శుక్ర", Sat: "శని", Sun: "ఆది" },
    units: { kg: "కిలోలు", litre: "లీటర్లు", pcs: "ముక్కలు", packet: "ప్యాకెట్లు" },
  },
};