import type { LangCode } from "@/lib/languages";

export type CategoryKey = "staples" | "pulses" | "oils" | "dairy" | "snacks" | "spices" | "household" | "other";

export const CATEGORY_ICON: Record<CategoryKey, string> = {
  staples: "🌾",
  pulses: "🫘",
  oils: "🧴",
  dairy: "🥛",
  snacks: "🍪",
  spices: "🌶️",
  household: "🧼",
  other: "📦",
};

export const CATEGORY_LABEL: Record<LangCode, Record<CategoryKey, string>> = {
  en: { staples: "Staples", pulses: "Pulses", oils: "Oil & ghee", dairy: "Dairy & fresh", snacks: "Snacks & drinks", spices: "Spices", household: "Household", other: "Other" },
  hi: { staples: "अनाज व राशन", pulses: "दालें", oils: "तेल व घी", dairy: "दूध व ताज़ा", snacks: "नाश्ता व पेय", spices: "मसाले", household: "घरेलू सामान", other: "अन्य" },
  mr: { staples: "धान्य व किराणा", pulses: "डाळी", oils: "तेल व तूप", dairy: "दूध व ताजे पदार्थ", snacks: "नाश्ता व पेये", spices: "मसाले", household: "घरगुती वस्तू", other: "इतर" },
  te: { staples: "ధాన్యాలు & సరుకులు", pulses: "పప్పులు", oils: "నూనె & నెయ్యి", dairy: "పాలు & తాజా", snacks: "స్నాక్స్ & పానీయాలు", spices: "మసాలాలు", household: "ఇంటి సామాగ్రి", other: "ఇతరాలు" },
};

const norm = (s: string) => s.replace(/\uFE0F/g, "");
const has = (list: string[], icon: string) => list.map(norm).includes(norm(icon));

export function categoryOf(p: { icon?: string; name: string }): CategoryKey {
  const i = p.icon || "";
  if (!i) return "other";
  if (has(["🍚", "🌾", "🍬", "🍯", "🧂"], i)) return "staples";
  if (has(["🫘"], i)) return "pulses";
  if (has(["🧴", "🫙"], i)) return "oils";
  if (has(["🥔"], i)) return /chip|wafer/i.test(p.name) ? "snacks" : "dairy";
  if (has(["🥛", "🥣", "🧈", "🧀", "🥚", "🍞", "🧅", "🍅"], i)) return "dairy";
  if (has(["🍵", "☕", "🍪", "🍜", "🍿", "💧", "🥤"], i)) return "snacks";
  if (has(["🌶️", "🌿"], i)) return "spices";
  if (has(["🧼", "🧺", "🧽", "🪥", "🔥"], i)) return "household";
  return "other";
}