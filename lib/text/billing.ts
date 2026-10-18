import type { LangCode } from "@/lib/languages";

type BillingText = {
  title: string; search: string; noItems: string; out: string;
  stock: (n: number, unit: string) => string;
  bill: string; pickItems: string; total: string;
  cash: string; credit: string; pickCustomer: string; newCustomer: string;
  due: string; confirm: string; wait: string;
  emptyBill: string; needCustomer: string;
  done: (total: number) => string;
  stockLow: string; generic: string;
  units: Record<string, string>;
};

export const billingText: Record<LangCode, BillingText> = {
  hi: {
    title: "बिल बनाएं", search: "सामान खोजें", noItems: "कोई सामान नहीं मिला", out: "खत्म",
    stock: (n, u) => `स्टॉक: ${n} ${u}`,
    bill: "बिल", pickItems: "ऊपर से सामान चुनें", total: "कुल (Total)",
    cash: "नकद (Cash)", credit: "उधार (Udhaar)",
    pickCustomer: "— पुराना ग्राहक चुनें —", newCustomer: "या नए ग्राहक का नाम लिखें",
    due: "बाकी", confirm: "बिल पक्का करें", wait: "रुकिए...",
    emptyBill: "बिल खाली है", needCustomer: "उधार के लिए ग्राहक चुनें या नाम लिखें",
    done: (t) => `बिल बन गया: ₹${t}`,
    stockLow: "स्टॉक कम है या सामान नहीं मिला", generic: "बिल नहीं बन पाया",
    units: { kg: "किलो", litre: "लीटर", pcs: "पीस", packet: "पैकेट" },
  },
  en: {
    title: "Make a bill", search: "Search items", noItems: "No items found", out: "Out of stock",
    stock: (n, u) => `Stock: ${n} ${u}`,
    bill: "Bill", pickItems: "Pick items from above", total: "Total",
    cash: "Cash", credit: "Udhaar (credit)",
    pickCustomer: "— Pick an existing customer —", newCustomer: "Or type a new customer's name",
    due: "due", confirm: "Confirm bill", wait: "Please wait...",
    emptyBill: "The bill is empty", needCustomer: "Pick a customer or type a name for udhaar",
    done: (t) => `Bill done: ₹${t}`,
    stockLow: "Not enough stock, or item not found", generic: "Could not make the bill",
    units: { kg: "kg", litre: "litre", pcs: "pcs", packet: "packet" },
  },
  mr: {
    title: "बिल बनवा", search: "माल शोधा", noItems: "कोणताही माल सापडला नाही", out: "संपले",
    stock: (n, u) => `साठा: ${n} ${u}`,
    bill: "बिल", pickItems: "वरून माल निवडा", total: "एकूण",
    cash: "रोख", credit: "उधार",
    pickCustomer: "— जुना ग्राहक निवडा —", newCustomer: "किंवा नवीन ग्राहकाचे नाव लिहा",
    due: "बाकी", confirm: "बिल पक्के करा", wait: "थांबा...",
    emptyBill: "बिल रिकामे आहे", needCustomer: "उधारीसाठी ग्राहक निवडा किंवा नाव लिहा",
    done: (t) => `बिल झाले: ₹${t}`,
    stockLow: "साठा कमी आहे किंवा माल सापडला नाही", generic: "बिल बनवता आले नाही",
    units: { kg: "किलो", litre: "लिटर", pcs: "नग", packet: "पॅकेट" },
  },
  te: {
    title: "బిల్లు చేయండి", search: "వస్తువులు వెతకండి", noItems: "వస్తువులు కనిపించలేదు", out: "అయిపోయింది",
    stock: (n, u) => `స్టాక్: ${n} ${u}`,
    bill: "బిల్లు", pickItems: "పై నుండి వస్తువులు ఎంచుకోండి", total: "మొత్తం",
    cash: "నగదు", credit: "బాకీ",
    pickCustomer: "— పాత కస్టమర్‌ను ఎంచుకోండి —", newCustomer: "లేదా కొత్త కస్టమర్ పేరు రాయండి",
    due: "బాకీ", confirm: "బిల్లు ఖరారు చేయండి", wait: "ఆగండి...",
    emptyBill: "బిల్లు ఖాళీగా ఉంది", needCustomer: "బాకీ కోసం కస్టమర్‌ను ఎంచుకోండి లేదా పేరు రాయండి",
    done: (t) => `బిల్లు అయింది: ₹${t}`,
    stockLow: "స్టాక్ సరిపోదు లేదా వస్తువు దొరకలేదు", generic: "బిల్లు చేయలేకపోయాం",
    units: { kg: "కిలోలు", litre: "లీటర్లు", pcs: "ముక్కలు", packet: "ప్యాకెట్లు" },
  },
};