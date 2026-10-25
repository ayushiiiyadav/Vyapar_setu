import type { LangCode } from "@/lib/languages";

type DashText = {
  recentTitle: string; bestTitle: string; splitTitle: string;
  cash: string; credit: string; last30: string; noBills: string;
  moreItems: (n: number) => string;
  sold: (q: number) => string;
};

export const DASH: Record<LangCode, DashText> = {
  en: {
    recentTitle: "Recent bills", bestTitle: "Best sellers", splitTitle: "Cash vs udhaar (30 days)",
    cash: "Cash", credit: "Udhaar", last30: "Last 30 days", noBills: "No bills yet",
    moreItems: (n) => `+${n} more`, sold: (q) => `${q} sold`,
  },
  hi: {
    recentTitle: "हाल के बिल", bestTitle: "सबसे ज़्यादा बिकने वाला", splitTitle: "नकद बनाम उधार (30 दिन)",
    cash: "नकद", credit: "उधार", last30: "पिछले 30 दिन", noBills: "अभी कोई बिल नहीं",
    moreItems: (n) => `+${n} और`, sold: (q) => `${q} बिके`,
  },
  mr: {
    recentTitle: "अलीकडील बिले", bestTitle: "सर्वाधिक विकले जाणारे", splitTitle: "रोख विरुद्ध उधार (30 दिवस)",
    cash: "रोख", credit: "उधार", last30: "मागील 30 दिवस", noBills: "अजून बिले नाहीत",
    moreItems: (n) => `+${n} आणखी`, sold: (q) => `${q} विकले`,
  },
  te: {
    recentTitle: "ఇటీవలి బిల్లులు", bestTitle: "ఎక్కువగా అమ్ముడైనవి", splitTitle: "నగదు vs బాకీ (30 రోజులు)",
    cash: "నగదు", credit: "బాకీ", last30: "గత 30 రోజులు", noBills: "ఇంకా బిల్లులు లేవు",
    moreItems: (n) => `+${n} మరిన్ని`, sold: (q) => `${q} అమ్ముడయ్యాయి`,
  },
};