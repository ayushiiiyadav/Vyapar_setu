import type { LangCode } from "@/lib/languages";

export type CatalogItem = {
  brand?: string;
  en: string;
  hi: string;
  mr: string;
  te: string;
  icon: string;
  unit: "kg" | "litre" | "pcs" | "packet";
  aka?: string;
};

export const CATALOG: CatalogItem[] = [
  // Grains and flour
  { en: "Rice", hi: "चावल", mr: "तांदूळ", te: "బియ్యం", icon: "🍚", unit: "kg", aka: "chawal tandul biyyam" },
  { brand: "India Gate", en: "Basmati Rice", hi: "बासमती चावल", mr: "बासमती तांदूळ", te: "బాస్మతి బియ్యం", icon: "🍚", unit: "kg", aka: "chawal" },
  { brand: "Daawat", en: "Basmati Rice", hi: "बासमती चावल", mr: "बासमती तांदूळ", te: "బాస్మతి బియ్యం", icon: "🍚", unit: "kg", aka: "chawal" },
  { brand: "Kohinoor", en: "Basmati Rice", hi: "बासमती चावल", mr: "बासमती तांदूळ", te: "బాస్మతి బియ్యం", icon: "🍚", unit: "kg", aka: "chawal" },
  { en: "Wheat Flour (Atta)", hi: "आटा", mr: "गव्हाचे पीठ", te: "గోధుమ పిండి", icon: "🌾", unit: "kg", aka: "atta gehu peeth" },
  { brand: "Aashirvaad", en: "Whole Wheat Atta", hi: "गेहूं का आटा", mr: "गव्हाचे पीठ", te: "గోధుమ పిండి", icon: "🌾", unit: "kg", aka: "atta" },
  { brand: "Pillsbury", en: "Chakki Fresh Atta", hi: "चक्की ताज़ा आटा", mr: "चक्की फ्रेश पीठ", te: "చక్కీ ఫ్రెష్ పిండి", icon: "🌾", unit: "kg", aka: "atta" },
  { en: "Maida", hi: "मैदा", mr: "मैदा", te: "మైదా", icon: "🌾", unit: "kg" },
  { en: "Semolina (Suji)", hi: "सूजी", mr: "रवा", te: "రవ్వ", icon: "🌾", unit: "kg", aka: "suji rava" },
  { en: "Poha", hi: "पोहा", mr: "पोहे", te: "అటుకులు", icon: "🍚", unit: "kg", aka: "poha pohe atukulu" },

  // Pulses
  { en: "Toor Dal", hi: "अरहर दाल", mr: "तूर डाळ", te: "కందిపప్పు", icon: "🫘", unit: "kg", aka: "dal arhar tur" },
  { en: "Moong Dal", hi: "मूंग दाल", mr: "मूग डाळ", te: "పెసరపప్పు", icon: "🫘", unit: "kg", aka: "dal mung" },
  { en: "Chana Dal", hi: "चना दाल", mr: "हरभरा डाळ", te: "శనగపప్పు", icon: "🫘", unit: "kg", aka: "dal" },
  { en: "Masoor Dal", hi: "मसूर दाल", mr: "मसूर डाळ", te: "మసూర్ పప్పు", icon: "🫘", unit: "kg", aka: "dal" },
  { en: "Urad Dal", hi: "उड़द दाल", mr: "उडीद डाळ", te: "మినపప్పు", icon: "🫘", unit: "kg", aka: "dal udad" },
  { brand: "Tata Sampann", en: "Toor Dal", hi: "अरहर दाल", mr: "तूर डाळ", te: "కందిపప్పు", icon: "🫘", unit: "kg", aka: "dal" },

  // Sugar, salt, jaggery
  { en: "Sugar", hi: "चीनी", mr: "साखर", te: "చక్కెర", icon: "🍬", unit: "kg", aka: "cheeni shakkar sakhar" },
  { en: "Jaggery", hi: "गुड़", mr: "गूळ", te: "బెల్లం", icon: "🍯", unit: "kg", aka: "gud gur bellam" },
  { en: "Salt", hi: "नमक", mr: "मीठ", te: "ఉప్పు", icon: "🧂", unit: "kg", aka: "namak meeth uppu" },
  { brand: "Tata", en: "Salt", hi: "नमक", mr: "मीठ", te: "ఉప్పు", icon: "🧂", unit: "kg", aka: "namak" },

  // Oil and ghee
  { brand: "Fortune", en: "Sunflower Oil", hi: "सूरजमुखी तेल", mr: "सूर्यफूल तेल", te: "పొద్దుతిరుగుడు నూనె", icon: "🧴", unit: "litre", aka: "tel oil" },
  { brand: "Fortune", en: "Soyabean Oil", hi: "सोयाबीन तेल", mr: "सोयाबीन तेल", te: "సోయాబీన్ నూనె", icon: "🧴", unit: "litre", aka: "tel oil" },
  { brand: "Dhara", en: "Mustard Oil", hi: "सरसों का तेल", mr: "मोहरीचे तेल", te: "ఆవ నూనె", icon: "🧴", unit: "litre", aka: "tel sarso oil" },
  { en: "Groundnut Oil", hi: "मूंगफली तेल", mr: "शेंगदाणा तेल", te: "వేరుశనగ నూనె", icon: "🧴", unit: "litre", aka: "tel oil" },
  { brand: "Amul", en: "Ghee", hi: "घी", mr: "तूप", te: "నెయ్యి", icon: "🫙", unit: "kg", aka: "ghee tup" },

  // Dairy and fresh
  { en: "Milk", hi: "दूध", mr: "दूध", te: "పాలు", icon: "🥛", unit: "litre", aka: "doodh dudh palu" },
  { brand: "Amul", en: "Taaza Milk", hi: "ताज़ा दूध", mr: "ताजे दूध", te: "తాజా పాలు", icon: "🥛", unit: "litre", aka: "doodh" },
  { brand: "Mother Dairy", en: "Milk", hi: "दूध", mr: "दूध", te: "పాలు", icon: "🥛", unit: "litre", aka: "doodh" },
  { en: "Curd (Dahi)", hi: "दही", mr: "दही", te: "పెరుగు", icon: "🥣", unit: "packet", aka: "dahi curd perugu" },
  { brand: "Amul", en: "Butter", hi: "मक्खन", mr: "लोणी", te: "వెన్న", icon: "🧈", unit: "packet", aka: "makhan butter" },
  { en: "Paneer", hi: "पनीर", mr: "पनीर", te: "పన్నీర్", icon: "🧀", unit: "packet" },
  { en: "Eggs", hi: "अंडे", mr: "अंडी", te: "గుడ్లు", icon: "🥚", unit: "pcs", aka: "ande anda gudlu egg" },
  { en: "Bread", hi: "ब्रेड", mr: "ब्रेड", te: "బ్రెడ్", icon: "🍞", unit: "packet", aka: "pav" },

  // Tea and coffee
  { en: "Tea Powder", hi: "चाय पत्ती", mr: "चहा पावडर", te: "టీ పొడి", icon: "🍵", unit: "kg", aka: "chai chaha patti" },
  { brand: "Tata Tea", en: "Gold Tea", hi: "गोल्ड चाय", mr: "गोल्ड चहा", te: "గోల్డ్ టీ", icon: "🍵", unit: "packet", aka: "chai" },
  { brand: "Brooke Bond", en: "Red Label Tea", hi: "रेड लेबल चाय", mr: "रेड लेबल चहा", te: "రెడ్ లేబుల్ టీ", icon: "🍵", unit: "packet", aka: "chai" },
  { brand: "Taj Mahal", en: "Tea", hi: "चाय", mr: "चहा", te: "టీ", icon: "🍵", unit: "packet", aka: "chai" },
  { brand: "Nescafe", en: "Classic Coffee", hi: "कॉफ़ी", mr: "कॉफी", te: "కాఫీ", icon: "☕", unit: "packet", aka: "coffee" },

  // Biscuits and snacks
  { brand: "Parle-G", en: "Biscuits", hi: "बिस्कुट", mr: "बिस्किटे", te: "బిస్కెట్లు", icon: "🍪", unit: "packet", aka: "biscuit parle" },
  { brand: "Britannia", en: "Good Day Biscuits", hi: "गुड डे बिस्कुट", mr: "गुड डे बिस्किटे", te: "గుడ్ డే బిస్కెట్లు", icon: "🍪", unit: "packet", aka: "biscuit" },
  { brand: "Britannia", en: "Marie Gold Biscuits", hi: "मैरी गोल्ड बिस्कुट", mr: "मेरी गोल्ड बिस्किटे", te: "మేరీ గోల్డ్ బిస్కెట్లు", icon: "🍪", unit: "packet", aka: "biscuit" },
  { brand: "Maggi", en: "Noodles", hi: "नूडल्स", mr: "नूडल्स", te: "నూడుల్స్", icon: "🍜", unit: "packet", aka: "noodles maggi" },
  { brand: "Sunfeast Yippee", en: "Noodles", hi: "नूडल्स", mr: "नूडल्स", te: "నూడుల్స్", icon: "🍜", unit: "packet", aka: "noodles" },
  { brand: "Kurkure", en: "Snacks", hi: "नमकीन", mr: "फरसाण", te: "స్నాక్స్", icon: "🍿", unit: "packet", aka: "namkeen" },
  { brand: "Lay's", en: "Chips", hi: "चिप्स", mr: "चिप्स", te: "చిప్స్", icon: "🥔", unit: "packet", aka: "chips wafers" },
  { brand: "Haldiram's", en: "Bhujia", hi: "भुजिया", mr: "भुजिया", te: "భుజియా", icon: "🍿", unit: "packet", aka: "namkeen" },

  // Spices
  { en: "Turmeric Powder", hi: "हल्दी पाउडर", mr: "हळद", te: "పసుపు", icon: "🌶️", unit: "packet", aka: "haldi halad pasupu" },
  { en: "Red Chilli Powder", hi: "लाल मिर्च पाउडर", mr: "लाल तिखट", te: "కారం", icon: "🌶️", unit: "packet", aka: "mirch tikhat karam" },
  { en: "Coriander Powder", hi: "धनिया पाउडर", mr: "धणे पावडर", te: "ధనియాల పొడి", icon: "🌿", unit: "packet", aka: "dhaniya dhane" },
  { en: "Cumin (Jeera)", hi: "जीरा", mr: "जिरे", te: "జీలకర్ర", icon: "🌿", unit: "packet", aka: "jeera jire" },
  { en: "Mustard Seeds", hi: "राई", mr: "मोहरी", te: "ఆవాలు", icon: "🌿", unit: "packet", aka: "rai sarson mohri avalu" },
  { brand: "MDH", en: "Garam Masala", hi: "गरम मसाला", mr: "गरम मसाला", te: "గరం మసాలా", icon: "🌶️", unit: "packet", aka: "masala" },

  // Household
  { brand: "Lux", en: "Soap", hi: "साबुन", mr: "साबण", te: "సబ్బు", icon: "🧼", unit: "pcs", aka: "sabun soap" },
  { brand: "Lifebuoy", en: "Soap", hi: "साबुन", mr: "साबण", te: "సబ్బు", icon: "🧼", unit: "pcs", aka: "sabun soap" },
  { brand: "Surf Excel", en: "Detergent Powder", hi: "डिटर्जेंट पाउडर", mr: "डिटर्जंट पावडर", te: "డిటర్జెంట్ పౌడర్", icon: "🧺", unit: "packet", aka: "detergent washing" },
  { brand: "Vim", en: "Dishwash", hi: "बर्तन धोने का साबुन", mr: "भांडी घासण्याचा साबण", te: "గిన్నెల సబ్బు", icon: "🧽", unit: "pcs", aka: "bartan" },
  { brand: "Colgate", en: "Toothpaste", hi: "टूथपेस्ट", mr: "टूथपेस्ट", te: "టూత్‌పేస్ట్", icon: "🪥", unit: "pcs", aka: "paste brush" },
  { en: "Matchbox", hi: "माचिस", mr: "आगपेटी", te: "అగ్గిపెట్టె", icon: "🔥", unit: "packet", aka: "machis" },

  // Drinks and loose vegetables
  { en: "Packaged Drinking Water", hi: "पानी की बोतल", mr: "पाण्याची बाटली", te: "మంచినీళ్ల సీసా", icon: "💧", unit: "pcs", aka: "pani water bottle" },
  { brand: "Thums Up", en: "Cold Drink", hi: "कोल्ड ड्रिंक", mr: "कोल्ड ड्रिंक", te: "కూల్ డ్రింక్", icon: "🥤", unit: "pcs", aka: "cold drink soda" },
  { en: "Onion", hi: "प्याज़", mr: "कांदा", te: "ఉల్లిపాయ", icon: "🧅", unit: "kg", aka: "pyaz kanda" },
  { en: "Potato", hi: "आलू", mr: "बटाटा", te: "బంగాళాదుంప", icon: "🥔", unit: "kg", aka: "aloo batata" },
  { en: "Tomato", hi: "टमाटर", mr: "टोमॅटो", te: "టమాటా", icon: "🍅", unit: "kg", aka: "tamatar" },
];

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const haystack = (i: CatalogItem) => [i.brand ?? "", i.en, i.hi, i.mr, i.te, i.aka ?? ""].map(norm);

export function searchCatalog(query: string, limit = 8): CatalogItem[] {
  const q = norm(query);
  if (!q) return [];
  const hits = CATALOG.filter((i) => haystack(i).some((x) => x.includes(q)));
  const rank = (i: CatalogItem) => (haystack(i).some((x) => x.startsWith(q)) ? 0 : 1);
  return hits.sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}

// English name stored in the database, e.g. "India Gate Basmati Rice"
export const productName = (i: Pick<CatalogItem, "brand" | "en">) =>
  i.brand ? `${i.brand} ${i.en}` : i.en;

// Name in a chosen language, e.g. "India Gate बासमती चावल"
export const catalogLabel = (i: CatalogItem, lang: LangCode) =>
  i.brand ? `${i.brand} ${i[lang]}` : i[lang];

// What the screens show for a saved product
export const displayName = (p: { name: string; names?: Record<string, string> }, lang: LangCode) =>
  p.names?.[lang] || p.name;