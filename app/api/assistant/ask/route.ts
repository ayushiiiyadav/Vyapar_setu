import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { chatJSON } from "@/lib/groq";
import { LANGS, isLang, type LangCode } from "@/lib/languages";
import { REPLIES } from "@/lib/replies";
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
    Product.find({ shopId: user.shopId }).select("name unit stock lowStockLimit").limit(200).lean(),
    Customer.find({ shopId: user.shopId }).select("name balance").limit(200).lean(),
  ]);
  const isOwner = user.role === "owner";

  const system = `You are the voice assistant of "Vyapar Setu", a shop app for Indian kirana shopkeepers. The shopkeeper is speaking ${LANGS[lang].english} (they may mix in Hindi or English words). Understand the request and reply ONLY with JSON in this shape:
{"intent": "check_stock" | "low_stock" | "today_sales" | "udhaar_total" | "udhaar_customer" | "navigate" | "unknown", "product": string or null, "customer": string or null, "page": "billing" | "products" | "udhaar" | "reports" | "dashboard" | null}

Rules:
- "product" must be EXACTLY one of these product names, or null if none fits: ${JSON.stringify(products.map((p: any) => p.name))}.Only return a product if the shopkeeper clearly said a word that means that item. If the word is unclear or garbled, return null instead of guessing.. Examples: rice = chawal = tandul (तांदूळ) = biyyam (బియ్యం); oil = tel = nune (నూనె); sugar = cheeni = sakhar (साखर) = panchadara (పంచదార); flour = atta = peeth (पीठ) = pindi (పిండి); salt = namak = meeth (मीठ) = uppu (ఉప్పు); dal = pappu (పప్పు).
- "customer" must be EXACTLY one of these names, or null: ${JSON.stringify(customers.map((c: any) => c.name))}. The name may be said in another script, so match it by sound.
- check_stock: asks how much of an item is left.
- low_stock: asks which items are low or finishing.
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

  const product: any = products.find((p: any) => p.name === intent.product);
  const customer: any = customers.find((c: any) => c.name === intent.customer);
  let reply = "";
  let navigate: string | undefined;

  switch (intent.intent) {
    case "check_stock": {
      if (!product) {
        reply = R.productNotFound;
      } else if (product.stock === 0) {
        reply = R.outOfStock(product.name);
      } else {
        reply = R.stock(product.name, product.stock, R.units[product.unit] || product.unit);
        if (product.stock <= product.lowStockLimit) reply += R.lowWarn;
      }
      break;
    }
    case "low_stock": {
      const low: any[] = products.filter((p: any) => p.stock <= p.lowStockLimit);
      reply =
        low.length === 0
          ? R.allFine
          : R.lowList(low.length, low.slice(0, 5).map((p) => p.name).join(", "));
      break;
    }
    case "today_sales": {
      if (!isOwner) {
        reply = R.ownerOnly;
        break;
      }
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
      if (!isOwner) {
        reply = R.ownerOnly;
        break;
      }
      const total = customers.reduce((s: number, c: any) => s + c.balance, 0);
      const count = customers.filter((c: any) => c.balance > 0).length;
      reply = total === 0 ? R.noUdhaar : R.udhaarTotal(count, total);
      break;
    }
    case "udhaar_customer": {
      if (!isOwner) {
        reply = R.ownerOnly;
        break;
      }
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
      } else if (pg.ownerOnly && !isOwner) {
        reply = R.ownerOnly;
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