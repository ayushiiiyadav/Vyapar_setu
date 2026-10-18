import type { LangCode } from "@/lib/languages";

type ProductsText = {
  title: string; search: string; addNew: string; noItems: string;
  out: string; low: string; ok: string;
  arrived: string;
  addTitle: string; name: string; price: string; stockQty: string; lowLimit: string; save: string;
  costPrice: string; supplier: string; expiryLabel: string;
  expired: string; expiresToday: string; expiresIn: (n: number) => string;
  stockTitle: (name: string) => string;
  current: string;
  howMany: (unit: string) => string;
  addStock: string;
  deleteTitle: string;
  deleteAsk: (name: string) => string;
  no: string; yesDelete: string;
  added: (name: string) => string;
  stockAdded: (name: string, n: number, unit: string) => string;
  removed: (name: string) => string;
  badQty: string; badInput: string; generic: string;
  units: Record<string, string>;
};

export const productsText: Record<LangCode, ProductsText> = {
  hi: {
    title: "सामान / स्टॉक", search: "सामान खोजें", addNew: "नया सामान जोड़ें", noItems: "कोई सामान नहीं मिला",
    out: "खत्म", low: "कम है", ok: "ठीक है",
    arrived: "माल आया",
    addTitle: "नया सामान जोड़ें", name: "नाम (जैसे: चावल)", price: "दाम ₹", stockQty: "कितना माल है", lowLimit: "कम होने की सीमा", save: "सेव करें",
    costPrice: "खरीद का दाम ₹ (वैकल्पिक)", supplier: "सप्लायर का नाम (वैकल्पिक)", expiryLabel: "एक्सपायरी की तारीख (वैकल्पिक)",
    expired: "एक्सपायर हो गया", expiresToday: "आज एक्सपायर", expiresIn: (n) => `${n} दिन में एक्सपायर`,
    stockTitle: (n) => `${n}: माल आया`,
    current: "अभी स्टॉक",
    howMany: (u) => `कितना ${u} आया?`,
    addStock: "माल जोड़ें",
    deleteTitle: "सामान हटाएं?",
    deleteAsk: (n) => `क्या आप ${n} को हटाना चाहते हैं?`,
    no: "नहीं", yesDelete: "हाँ, हटाएं",
    added: (n) => `${n} जुड़ गया`,
    stockAdded: (n, q, u) => `${n}: ${q} ${u} माल जुड़ा`,
    removed: (n) => `${n} हटा दिया`,
    badQty: "सही मात्रा लिखें", badInput: "नाम और सही दाम लिखें", generic: "कुछ गलत हुआ",
    units: { kg: "किलो", litre: "लीटर", pcs: "पीस", packet: "पैकेट" },
  },
  en: {
    title: "Items / Stock", search: "Search items", addNew: "Add a new item", noItems: "No items found",
    out: "Out of stock", low: "Running low", ok: "In stock",
    arrived: "Stock arrived",
    addTitle: "Add a new item", name: "Name (e.g. rice)", price: "Price ₹", stockQty: "How much stock", lowLimit: "Low stock limit", save: "Save",
    costPrice: "Purchase price ₹ (optional)", supplier: "Supplier name (optional)", expiryLabel: "Expiry date (optional)",
    expired: "Expired", expiresToday: "Expires today", expiresIn: (n) => `Expires in ${n} days`,
    stockTitle: (n) => `${n}: stock arrived`,
    current: "Current stock",
    howMany: (u) => `How many ${u} arrived?`,
    addStock: "Add stock",
    deleteTitle: "Remove this item?",
    deleteAsk: (n) => `Do you want to remove ${n}?`,
    no: "No", yesDelete: "Yes, remove",
    added: (n) => `${n} added`,
    stockAdded: (n, q, u) => `${n}: added ${q} ${u}`,
    removed: (n) => `${n} removed`,
    badQty: "Enter a valid quantity", badInput: "Enter a name and a valid price", generic: "Something went wrong",
    units: { kg: "kg", litre: "litre", pcs: "pcs", packet: "packet" },
  },
  mr: {
    title: "माल / साठा", search: "माल शोधा", addNew: "नवीन माल जोडा", noItems: "कोणताही माल सापडला नाही",
    out: "संपले", low: "कमी आहे", ok: "ठीक आहे",
    arrived: "माल आला",
    addTitle: "नवीन माल जोडा", name: "नाव (उदा. तांदूळ)", price: "किंमत ₹", stockQty: "किती माल आहे", lowLimit: "कमी होण्याची मर्यादा", save: "सेव्ह करा",
    costPrice: "खरेदी किंमत ₹ (ऐच्छिक)", supplier: "पुरवठादाराचे नाव (ऐच्छिक)", expiryLabel: "मुदत संपण्याची तारीख (ऐच्छिक)",
    expired: "मुदत संपली", expiresToday: "आज मुदत संपते", expiresIn: (n) => `${n} दिवसांत मुदत संपते`,
    stockTitle: (n) => `${n}: माल आला`,
    current: "सध्याचा साठा",
    howMany: (u) => `किती ${u} आला?`,
    addStock: "माल जोडा",
    deleteTitle: "माल हटवायचा?",
    deleteAsk: (n) => `तुम्हाला ${n} हटवायचे आहे का?`,
    no: "नाही", yesDelete: "हो, हटवा",
    added: (n) => `${n} जोडले`,
    stockAdded: (n, q, u) => `${n}: ${q} ${u} माल जोडला`,
    removed: (n) => `${n} हटवले`,
    badQty: "योग्य प्रमाण लिहा", badInput: "नाव आणि योग्य किंमत लिहा", generic: "काहीतरी चुकले",
    units: { kg: "किलो", litre: "लिटर", pcs: "नग", packet: "पॅकेट" },
  },
  te: {
    title: "వస్తువులు / స్టాక్", search: "వస్తువులు వెతకండి", addNew: "కొత్త వస్తువు జోడించండి", noItems: "వస్తువులు కనిపించలేదు",
    out: "అయిపోయింది", low: "తక్కువగా ఉంది", ok: "సరిపడా ఉంది",
    arrived: "సరుకు వచ్చింది",
    addTitle: "కొత్త వస్తువు జోడించండి", name: "పేరు (ఉదా: బియ్యం)", price: "ధర ₹", stockQty: "ఎంత స్టాక్ ఉంది", lowLimit: "తక్కువ స్టాక్ పరిమితి", save: "సేవ్ చేయండి",
    costPrice: "కొనుగోలు ధర ₹ (ఐచ్ఛికం)", supplier: "సరఫరాదారు పేరు (ఐచ్ఛికం)", expiryLabel: "గడువు తేదీ (ఐచ్ఛికం)",
    expired: "గడువు ముగిసింది", expiresToday: "ఈ రోజే గడువు ముగుస్తుంది", expiresIn: (n) => `${n} రోజుల్లో గడువు ముగుస్తుంది`,
    stockTitle: (n) => `${n}: సరుకు వచ్చింది`,
    current: "ప్రస్తుత స్టాక్",
    howMany: (u) => `ఎన్ని ${u} వచ్చాయి?`,
    addStock: "సరుకు జోడించండి",
    deleteTitle: "వస్తువును తొలగించాలా?",
    deleteAsk: (n) => `${n} ను తొలగించాలా?`,
    no: "వద్దు", yesDelete: "అవును, తొలగించండి",
    added: (n) => `${n} జోడించబడింది`,
    stockAdded: (n, q, u) => `${n}: ${q} ${u} సరుకు జోడించబడింది`,
    removed: (n) => `${n} తొలగించబడింది`,
    badQty: "సరైన పరిమాణం రాయండి", badInput: "పేరు, సరైన ధర రాయండి", generic: "ఏదో తప్పు జరిగింది",
    units: { kg: "కిలోలు", litre: "లీటర్లు", pcs: "ముక్కలు", packet: "ప్యాకెట్లు" },
  },
};