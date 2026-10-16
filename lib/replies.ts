import type { LangCode } from "./languages";

export type Replies = {
  units: Record<string, string>;
  productNotFound: string;
  outOfStock: (name: string) => string;
  stock: (name: string, n: number, unit: string) => string;
  lowWarn: string;
  allFine: string;
  lowList: (count: number, names: string) => string;
  ownerOnly: string;
  noSalesToday: string;
  salesToday: (count: number, total: number) => string;
  noUdhaar: string;
  udhaarTotal: (count: number, total: number) => string;
  customerNotFound: string;
  customerClear: (name: string) => string;
  customerOwes: (name: string, amt: number) => string;
  navUnknown: string;
  unknown: string;
  brainFail: string;
  nav: Record<string, string>;
};

export const REPLIES: Record<LangCode, Replies> = {
  hi: {
    units: { kg: "किलो", litre: "लीटर", pcs: "पीस", packet: "पैकेट" },
    productNotFound: "यह सामान मुझे नहीं मिला। सामान का नाम फिर से बोलिए।",
    outOfStock: (n) => `${n} खत्म हो गया है।`,
    stock: (n, q, u) => `${n} का ${q} ${u} स्टॉक बचा है।`,
    lowWarn: " यह कम है, जल्दी मंगवा लीजिए।",
    allFine: "सब सामान ठीक है, कुछ भी कम नहीं है।",
    lowList: (c, names) => `${c} सामान कम हैं: ${names}।`,
    ownerOnly: "यह जानकारी सिर्फ़ मालिक देख सकते हैं।",
    noSalesToday: "आज अभी तक कोई बिक्री नहीं हुई।",
    salesToday: (c, t) => `आज अब तक ${c} बिल बने और कुल ${t} रुपये की बिक्री हुई।`,
    noUdhaar: "किसी का उधार बाकी नहीं है।",
    udhaarTotal: (c, t) => `${c} लोगों का कुल ${t} रुपये उधार बाकी है।`,
    customerNotFound: "यह नाम मुझे उधार खाते में नहीं मिला।",
    customerClear: (n) => `${n} का कोई उधार बाकी नहीं है।`,
    customerOwes: (n, a) => `${n} का ${a} रुपये बाकी है।`,
    navUnknown: "मैं समझ नहीं पाया कि कौन सा पन्ना खोलना है।",
    unknown: "माफ़ कीजिए, मैं समझ नहीं पाया। आप पूछ सकते हैं: चावल कितना बचा है, आज की बिक्री कितनी हुई, या बिल कैसे बनाएं।",
    brainFail: "माफ़ कीजिए, अभी समझ नहीं पाया। फिर से बोलिए।",
    nav: {
      billing: "ठीक है, बिल वाला पन्ना खोल रहा हूँ। सामान पर दबाइए, फिर नकद या उधार चुनिए, और आख़िर में हरा बटन दबाइए।",
      products: "स्टॉक वाला पन्ना खोल रहा हूँ। यहाँ हर सामान का बचा हुआ माल दिखता है। नया माल आया हो तो 'माल आया' दबाइए।",
      udhaar: "उधार खाता खोल रहा हूँ। जिसने पैसे दिए, उसके नाम के आगे 'पैसे मिले' दबाइए।",
      reports: "रिपोर्ट खोल रहा हूँ। यहाँ आज की बिक्री और सबसे ज़्यादा बिकने वाला सामान दिखता है।",
      dashboard: "होम पेज खोल रहा हूँ।",
    },
  },
  en: {
    units: { kg: "kilos", litre: "litres", pcs: "pieces", packet: "packets" },
    productNotFound: "I couldn't find that item. Please say the item name again.",
    outOfStock: (n) => `${n} is out of stock.`,
    stock: (n, q, u) => `${q} ${u} of ${n} left in stock.`,
    lowWarn: " That is low, please reorder soon.",
    allFine: "Everything is in stock, nothing is running low.",
    lowList: (c, names) => `${c} items are running low: ${names}.`,
    ownerOnly: "Only the owner can see this information.",
    noSalesToday: "There have been no sales today.",
    salesToday: (c, t) => `So far today there were ${c} bills, with total sales of ${t} rupees.`,
    noUdhaar: "Nobody owes you anything.",
    udhaarTotal: (c, t) => `${c} people owe a total of ${t} rupees.`,
    customerNotFound: "I couldn't find that name in the udhaar ledger.",
    customerClear: (n) => `${n} has nothing pending.`,
    customerOwes: (n, a) => `${n} owes ${a} rupees.`,
    navUnknown: "I couldn't tell which page to open.",
    unknown: "Sorry, I didn't understand. You can ask: how much rice is left, how much did we sell today, or how do I make a bill.",
    brainFail: "Sorry, I couldn't understand that. Please say it again.",
    nav: {
      billing: "Okay, opening the billing page. Tap the items, choose cash or udhaar, and finally press the green button.",
      products: "Opening the stock page. Here you can see what is left of every item. When new stock arrives, press the stock arrived button.",
      udhaar: "Opening the udhaar ledger. When someone pays, press the money received button next to their name.",
      reports: "Opening the reports. Here you can see today's sales and your best selling items.",
      dashboard: "Opening the home page.",
    },
  },
  mr: {
    units: { kg: "किलो", litre: "लिटर", pcs: "नग", packet: "पॅकेट" },
    productNotFound: "हा माल मला सापडला नाही. कृपया मालाचे नाव पुन्हा सांगा.",
    outOfStock: (n) => `${n} संपले आहे.`,
    stock: (n, q, u) => `${n}: ${q} ${u} शिल्लक आहे.`,
    lowWarn: " हे कमी आहे, लवकर मागवा.",
    allFine: "सर्व माल व्यवस्थित आहे, काहीही कमी नाही.",
    lowList: (c, names) => `${c} वस्तू कमी आहेत: ${names}.`,
    ownerOnly: "ही माहिती फक्त मालकच पाहू शकतात.",
    noSalesToday: "आज अजून एकही विक्री झालेली नाही.",
    salesToday: (c, t) => `आज आतापर्यंत ${c} बिले झाली आणि एकूण ${t} रुपयांची विक्री झाली.`,
    noUdhaar: "कोणाचीही उधारी बाकी नाही.",
    udhaarTotal: (c, t) => `${c} जणांची मिळून एकूण ${t} रुपये उधारी बाकी आहे.`,
    customerNotFound: "हे नाव मला उधारी खात्यात सापडले नाही.",
    customerClear: (n) => `${n} यांची कोणतीही उधारी बाकी नाही.`,
    customerOwes: (n, a) => `${n} यांचे ${a} रुपये बाकी आहेत.`,
    navUnknown: "कोणते पान उघडायचे ते मला समजले नाही.",
    unknown: "माफ करा, मला समजले नाही. तुम्ही विचारू शकता: तांदूळ किती शिल्लक आहे, आज किती विक्री झाली, किंवा बिल कसे बनवायचे.",
    brainFail: "माफ करा, मला आत्ता समजले नाही. कृपया पुन्हा बोला.",
    nav: {
      billing: "ठीक आहे, बिलाचे पान उघडत आहे. वस्तूंवर दाबा, रोख किंवा उधार निवडा आणि शेवटी हिरवे बटण दाबा.",
      products: "माल शिल्लकीचे पान उघडत आहे. येथे प्रत्येक वस्तूचा शिल्लक साठा दिसतो. नवीन माल आला असेल तर 'माल आला' दाबा.",
      udhaar: "उधारी खाते उघडत आहे. ज्याने पैसे दिले त्याच्या नावापुढे 'पैसे मिळाले' दाबा.",
      reports: "अहवाल उघडत आहे. येथे आजची विक्री आणि सर्वात जास्त विकला जाणारा माल दिसतो.",
      dashboard: "मुख्य पान उघडत आहे.",
    },
  },
  te: {
    units: { kg: "కిలోలు", litre: "లీటర్లు", pcs: "ముక్కలు", packet: "ప్యాకెట్లు" },
    productNotFound: "ఆ వస్తువు నాకు కనిపించలేదు. దయచేసి వస్తువు పేరు మళ్లీ చెప్పండి.",
    outOfStock: (n) => `${n} అయిపోయింది.`,
    stock: (n, q, u) => `${n} స్టాక్ ${q} ${u} మిగిలి ఉంది.`,
    lowWarn: " ఇది తక్కువగా ఉంది, త్వరగా తెప్పించండి.",
    allFine: "అన్ని వస్తువులు సరిపడా ఉన్నాయి, ఏదీ తక్కువగా లేదు.",
    lowList: (c, names) => `${c} వస్తువులు తక్కువగా ఉన్నాయి: ${names}.`,
    ownerOnly: "ఈ సమాచారం యజమాని మాత్రమే చూడగలరు.",
    noSalesToday: "ఈ రోజు ఇప్పటివరకు అమ్మకాలు లేవు.",
    salesToday: (c, t) => `ఈ రోజు ఇప్పటివరకు ${c} బిల్లులు అయ్యాయి, మొత్తం ${t} రూపాయల అమ్మకాలు జరిగాయి.`,
    noUdhaar: "ఎవరికీ బాకీ లేదు.",
    udhaarTotal: (c, t) => `${c} మంది నుండి మొత్తం ${t} రూపాయలు బాకీ రావాలి.`,
    customerNotFound: "ఆ పేరు బాకీ ఖాతాలో నాకు కనిపించలేదు.",
    customerClear: (n) => `${n} గారికి ఎలాంటి బాకీ లేదు.`,
    customerOwes: (n, a) => `${n} గారు ${a} రూపాయలు బాకీ ఉన్నారు.`,
    navUnknown: "ఏ పేజీ తెరవాలో నాకు అర్థం కాలేదు.",
    unknown: "క్షమించండి, నాకు అర్థం కాలేదు. మీరు ఇలా అడగవచ్చు: బియ్యం ఎంత మిగిలి ఉన్నాయి, ఈ రోజు ఎంత అమ్మకాలు జరిగాయి, లేదా బిల్లు ఎలా తయారు చేయాలి.",
    brainFail: "క్షమించండి, ఇప్పుడు అర్థం కాలేదు. దయచేసి మళ్లీ చెప్పండి.",
    nav: {
      billing: "సరే, బిల్లు పేజీ తెరుస్తున్నాను. వస్తువులపై నొక్కండి, నగదు లేదా బాకీ ఎంచుకుని, చివరగా ఆకుపచ్చ బటన్ నొక్కండి.",
      products: "స్టాక్ పేజీ తెరుస్తున్నాను. ఇక్కడ ప్రతి వస్తువు మిగిలిన స్టాక్ కనిపిస్తుంది. కొత్త సరుకు వచ్చినప్పుడు 'సరుకు వచ్చింది' నొక్కండి.",
      udhaar: "బాకీ ఖాతా తెరుస్తున్నాను. డబ్బులు ఇచ్చిన వారి పేరు పక్కన 'డబ్బులు వచ్చాయి' నొక్కండి.",
      reports: "రిపోర్టులు తెరుస్తున్నాను. ఇక్కడ ఈ రోజు అమ్మకాలు, ఎక్కువగా అమ్ముడయ్యే వస్తువులు కనిపిస్తాయి.",
      dashboard: "హోమ్ పేజీ తెరుస్తున్నాను.",
    },
  },
};