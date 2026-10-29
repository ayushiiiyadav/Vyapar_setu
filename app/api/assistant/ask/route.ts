import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { chatJSON } from "@/lib/groq";
import { LANGS, isLang, type LangCode } from "@/lib/languages";
import { REPLIES } from "@/lib/replies";
import { displayName } from "@/lib/catalog";
import Product from "@/models/product";
import Customer from "@/models/customer";
import Sale from "@/models/sale";

const pages: Record<string, { path: string; ownerOnly?: boolean }> = {
  billing: { path: "/billing" },
  products: { path: "/products" },
  udhaar: { path: "/udhaar" },
  reports: { path: "/reports", ownerOnly: true },
  dashboard: { path: "/dashboard" },
};

const SPLIT = /[\s,.;:!?()\-\/'"\u201c\u201d\u0964|]+/;
const words = (s: string) =>
  s.toLowerCase().split(SPLIT).filter((w) => w.length >= 2);

// Finds the items whose names (in any language) share the most words with what was said
function matchProducts(text: string, products: any[]): any[] {
  const spoken = new Set(words(text));
  let best = 0;
  const scored = products.map((p) => {
    const keys = new Set<string>();
    [p.name, p.names?.en, p.names?.hi, p.names?.mr, p.names?.te, p.keys].forEach((v) => {
      if (v) words(String(v)).forEach((w) => keys.add(w));
    });
    let score = 0;
    keys.forEach((w) => {
      if (spoken.has(w)) score++;
    });
    if (score > best) best = score;
    return { p, score };
  });
  return best === 0 ? [] : scored.filter((x) => x.score === best).map((x) => x.p);
}

// Converts what the shopkeeper said ("500 g") into the product's own unit ("kg")
const norm = (u: any) => String(u || "").toLowerCase().trim();
const isKg = (x: string) => x === "kg" || x === "kilo";
const isG = (x: string) => x === "g" || x === "gm" || x === "gram";
const isL = (x: string) => x === "l" || x === "litre" || x === "liter" || x === "ltr";
const isMl = (x: string) => x === "ml";

const isCount = (x: string) => ["pcs", "pc", "piece", "pieces", "packet", "packets"].includes(x);
const sameFamily = (s: string, t: string) =>
  (isKg(s) && isKg(t)) || (isG(s) && isG(t)) || (isL(s) && isL(t)) || (isMl(s) && isMl(t)) || (isCount(s) && isCount(t));

// If the shopkeeper said a unit the item can't use (e.g. "packets" for an item counted in kg),
// we flag a mismatch instead of silently changing the unit.
function toProductUnit(qty: number, said: any, productUnit: any): { qty: number; mismatch: boolean } {
  if (!Number.isFinite(qty)) return { qty: NaN, mismatch: false };
  const s = norm(said);
  const t = norm(productUnit);
  let out = qty;
  if (!s || s === t) return { qty: Math.round(out * 1000) / 1000, mismatch: false };
  if (isG(s) && isKg(t)) out = qty / 1000;
  else if (isKg(s) && isG(t)) out = qty * 1000;
  else if (isMl(s) && isL(t)) out = qty / 1000;
  else if (isL(s) && isMl(t)) out = qty * 1000;
  else if (!sameFamily(s, t)) return { qty, mismatch: true };
  return { qty: Math.round(out * 1000) / 1000, mismatch: false };
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const text = String(body.text || "").trim().slice(0, 300);
  const lang: LangCode = isLang(body.lang) ? body.lang : "hi";
  const R = REPLIES[lang];
  if (!text) return NextResponse.json({ error: "Kuch bolkar dekhiye" }, { status: 400 });

  await connectDB();
  const [products, customers] = await Promise.all([
    Product.find({ shopId: user.shopId })
      .select("name names keys unit stock lowStockLimit expiryDate")
      .limit(300)
      .lean(),
    Customer.find({ shopId: user.shopId }).select("name balance").limit(200).lean(),
  ]);

  const system = `You are the voice assistant of "Vyapar Setu", a shop app for Indian kirana shopkeepers. The shopkeeper is speaking ${LANGS[lang].english} (they may mix in Hindi or English words). Understand the request and reply ONLY with JSON in this shape:
{"intent": "check_stock" | "low_stock" | "expiring_soon" | "today_sales" | "udhaar_total" | "udhaar_customer" | "add_stock" | "navigate" | "unknown", "product": string or null, "customer": string or null, "quantity": number or null, "unit": "kg" | "g" | "l" | "ml" | "piece" | "packet" | null, "page": "billing" | "products" | "udhaar" | "reports" | "dashboard" | null}

Rules:
- "product" must be EXACTLY one of these product names, or null if none fits: ${JSON.stringify(products.map((p: any) => p.name))}. Only return a product if the shopkeeper clearly said a word that means that item. If the word is unclear or garbled, return null instead of guessing.
- "customer" must be EXACTLY one of these names, or null: ${JSON.stringify(customers.map((c: any) => c.name))}. The name may be said in another script, so match it by sound.
- "quantity" is a plain positive number in digits (convert spoken numbers in any language, e.g. "do", "don", "rendu" -> 2; "aadha" -> 0.5). If no amount was clearly said, return null. "unit" is the unit the shopkeeper said (kilo -> "kg", gram -> "g", litre -> "l"), or null if none was said.
- check_stock: asks how much of an item is left.
- low_stock: asks which items are low or finishing.
- expiring_soon: asks which items are expiring soon or have expired.
- today_sales: asks about today's sales or earnings.
- udhaar_total: asks total credit pending. udhaar_customer: asks how much one person owes.
- add_stock: tells you to add, put in, or increase stock of an item (e.g. "add 2 kg rice", "2 kilo chawal add karo"), whether or not the amount is given.
- navigate: wants to open a screen or learn how to do something. Making a bill -> billing. Opening the stock screen -> products. Receiving credit payments or the udhaar ledger -> udhaar. Reports -> reports. Home -> dashboard.
- Anything else: unknown.`;

  let intent: any;
  try {
    intent = await chatJSON(system, text);
  } catch (e) {
    console.error("Groq error:", e);
    return NextResponse.json({ reply: R.brainFail });
  }

  const customer: any = customers.find((c: any) => c.name === intent.customer);
  let reply = "";
  let navigate: string | undefined;
  let action: Record<string, unknown> | undefined;

  const stockLine = (p: any) =>
    p.stock === 0
      ? R.outOfStock(displayName(p, lang))
      : R.stock(displayName(p, lang), p.stock, R.units[p.unit] || p.unit) +
        (p.stock <= p.lowStockLimit ? R.lowWarn : "");

  switch (intent.intent) {
    case "check_stock": {
      let found = matchProducts(text, products);
      if (found.length === 0) {
        const viaAI = products.find((p: any) => p.name === intent.product);
        if (viaAI) found = [viaAI];
      }
      reply = found.length === 0 ? R.productNotFound : found.slice(0, 3).map(stockLine).join(" ");
      break;
    }
    case "low_stock": {
      const low: any[] = products.filter((p: any) => p.stock <= p.lowStockLimit);
      reply =
        low.length === 0
          ? R.allFine
          : R.lowList(low.length, low.slice(0, 5).map((p) => displayName(p, lang)).join(", "));
      break;
    }
    case "expiring_soon": {
      const limit = Date.now() + 7 * 86400000;
      const soon: any[] = products
        .filter((p: any) => p.expiryDate && new Date(p.expiryDate).getTime() <= limit)
        .sort((a: any, b: any) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
      reply =
        soon.length === 0
          ? R.noExpiring
          : R.expiring(soon.length, soon.slice(0, 5).map((p) => displayName(p, lang)).join(", "));
      break;
    }
    case "today_sales": {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const sales: any[] = await Sale.find({ shopId: user.shopId, createdAt: { $gte: start } })
        .select("total")
        .lean();
      const total = sales.reduce((s, x) => s + x.total, 0);
      reply = sales.length === 0 ? R.noSalesToday : R.salesToday(sales.length, total);
      break;
    }
    case "udhaar_total": {
      const total = customers.reduce((s: number, c: any) => s + c.balance, 0);
      const count = customers.filter((c: any) => c.balance > 0).length;
      reply = total === 0 ? R.noUdhaar : R.udhaarTotal(count, total);
      break;
    }
    case "udhaar_customer": {
      reply = !customer
        ? R.customerNotFound
        : customer.balance === 0
        ? R.customerClear(customer.name)
        : R.customerOwes(customer.name, customer.balance);
      break;
    }
    case "add_stock": {
      // Nothing is saved here. We only work out WHAT to add and ask for confirmation.
      // The real update happens when the owner taps Yes (frontend calls /api/purchases).
      let found: any[] = [];
      const viaAI = products.find((p: any) => p.name === intent.product);
      if (viaAI) found = [viaAI];
      else found = matchProducts(text, products);

      if (found.length === 0) {
        reply = R.productNotFound;
        break;
      }
      if (found.length > 1) {
        reply = R.askWhich(found.slice(0, 4).map((p) => displayName(p, lang)).join(", "));
        break;
      }

      const p = found[0];
      const name = displayName(p, lang);
      const unitLabel = R.units[p.unit] || p.unit;
      const conv = toProductUnit(Number(intent.quantity), intent.unit, p.unit);
      if (conv.mismatch) {
        reply = R.unitMismatch(name, unitLabel);
        break;
      }
      const qty = conv.qty;
      if (!(qty > 0) || qty > 100000) {
        reply = R.askQty(name);
        break;
      }

      reply = R.confirmAdd(name, qty, unitLabel);
      action = {
        type: "add_stock",
        productId: String(p._id),
        qty,
        yesLabel: R.yes,
        noLabel: R.no,
        doneText: R.added(name, qty, unitLabel),
        cancelText: R.cancelled,
        failText: R.addFailed,
      };
      break;
    }
    case "navigate": {
      const pg = pages[intent.page];
      if (!pg) {
        reply = R.navUnknown;
      } else {
        reply = R.nav[intent.page];
        navigate = pg.path;
      }
      break;
    }
    default:
      reply = R.unknown;
  }

  return NextResponse.json({ reply, navigate, action });
}