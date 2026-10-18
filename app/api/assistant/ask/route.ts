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
{"intent": "check_stock" | "low_stock" | "expiring_soon" | "today_sales" | "udhaar_total" | "udhaar_customer" | "navigate" | "unknown", "product": string or null, "customer": string or null, "page": "billing" | "products" | "udhaar" | "reports" | "dashboard" | null}

Rules:
- "product" must be EXACTLY one of these product names, or null if none fits: ${JSON.stringify(products.map((p: any) => p.name))}. Only return a product if the shopkeeper clearly said a word that means that item. If the word is unclear or garbled, return null instead of guessing.
- "customer" must be EXACTLY one of these names, or null: ${JSON.stringify(customers.map((c: any) => c.name))}. The name may be said in another script, so match it by sound.
- check_stock: asks how much of an item is left.
- low_stock: asks which items are low or finishing.
- expiring_soon: asks which items are expiring soon or have expired.
- today_sales: asks about today's sales or earnings.
- udhaar_total: asks total credit pending. udhaar_customer: asks how much one person owes.
- navigate: wants to open a screen or learn how to do something. Making a bill -> billing. Adding or seeing stock -> products. Receiving credit payments or the udhaar ledger -> udhaar. Reports -> reports. Home -> dashboard.
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

  return NextResponse.json({ reply, navigate });
}