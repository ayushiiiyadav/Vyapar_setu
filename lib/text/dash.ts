import type { LangCode } from "@/lib/languages";

type DashText = {
  recentBills: string; recentProducts: string; categoriesTitle: string;
  searchPh: string; noMatch: string;
  colProduct: string; colCategory: string; colStock: string; colStatus: string;
  itemsCount: (n: number) => string; lowCount: (n: number) => string; allOk: string;
  cash: string; credit: string; last30: string; noBills: string;
  moreItems: (n: number) => string;
};

export const DASH: Record<LangCode, DashText> = {
  en: {
    recentBills: "Recent bills", recentProducts: "Recent products", categoriesTitle: "Categories",
    searchPh: "Search items", noMatch: "No matching items",
    colProduct: "Product", colCategory: "Category", colStock: "Stock", colStatus: "Status",
    itemsCount: (n) => `${n} ${n === 1 ? "item" : "items"}`, lowCount: (n) => `${n} low`, allOk: "All fine",
    cash: "Cash", credit: "Udhaar", last30: "Last 30 days", noBills: "No bills yet",
    moreItems: (n) => `+${n} more`,
  },
  hi: {
    recentBills: "हाल के बिल", recentProducts: "हाल का सामान", categoriesTitle: "श्रेणियाँ",
    searchPh: "सामान खोजें", noMatch: "कोई सामान नहीं मिला",
    colProduct: "सामान", colCategory: "श्रेणी", colStock: "स्टॉक", colStatus: "स्थिति",
    itemsCount: (n) => `${n} सामान`, lowCount: (n) => `${n} कम`, allOk: "सब ठीक",
    cash: "नकद", credit: "उधार", last30: "पिछले 30 दिन", noBills: "अभी कोई बिल नहीं",
    moreItems: (n) => `+${n} और`,
  },
  mr: {
    recentBills: "अलीकडील बिले", recentProducts: "अलीकडील माल", categoriesTitle: "वर्गवारी",
    searchPh: "माल शोधा", noMatch: "कोणताही माल सापडला नाही",
    colProduct: "माल", colCategory: "प्रकार", colStock: "साठा", colStatus: "स्थिती",
    itemsCount: (n) => `${n} वस्तू`, lowCount: (n) => `${n} कमी`, allOk: "सर्व ठीक",
    cash: "रोख", credit: "उधार", last30: "मागील 30 दिवस", noBills: "अजून बिले नाहीत",
    moreItems: (n) => `+${n} आणखी`,
  },
  te: {
    recentBills: "ఇటీవలి బిల్లులు", recentProducts: "ఇటీవలి వస్తువులు", categoriesTitle: "వర్గాలు",
    searchPh: "వస్తువులు వెతకండి", noMatch: "సరిపోలే వస్తువులు లేవు",
    colProduct: "వస్తువు", colCategory: "వర్గం", colStock: "స్టాక్", colStatus: "స్థితి",
    itemsCount: (n) => `${n} వస్తువులు`, lowCount: (n) => `${n} తక్కువ`, allOk: "అంతా బాగుంది",
    cash: "నగదు", credit: "బాకీ", last30: "గత 30 రోజులు", noBills: "ఇంకా బిల్లులు లేవు",
    moreItems: (n) => `+${n} మరిన్ని`,
  },
};