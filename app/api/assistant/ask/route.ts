import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import { chatJSON } from "@/lib/groq";
import Product from "@/models/product";
import Customer from "@/models/customer";
import Sale from "@/models/sale";

const unitHi: Record<string, string> = { kg: "किलो", litre: "लीटर", pcs: "पीस", packet: "पैकेट" };
const OWNER_ONLY = "यह जानकारी सिर्फ़ मालिक देख सकते हैं।";

const pages: Record<string, { path: string; text: string; ownerOnly?: boolean }> = {
  billing: {
    path: "/billing",
    text: "ठीक है, बिल वाला पन्ना खोल रहा हूँ। सामान पर दबाइए, फिर नकद या उधार चुनिए, और आख़िर में हरा बटन दबाइए।",
  },
  products: {
    path: "/products",
    text: "स्टॉक वाला पन्ना खोल रहा हूँ। यहाँ हर सामान का बचा हुआ माल दिखता है। नया माल आया हो तो 'माल आया' दबाइए।",
  },
  udhaar: {
    path: "/udhaar",
    text: "उधार खाता खोल रहा हूँ। जिसने पैसे दिए, उसके नाम के आगे 'पैसे मिले' दबाइए।",
  },
  reports: {
    path: "/reports",
    ownerOnly: true,
    text: "रिपोर्ट खोल रहा हूँ। यहाँ आज की बिक्री और सबसे ज़्यादा बिकने वाला सामान दिखता है।",
  },
  dashboard: { path: "/dashboard", text: "होम पेज खोल रहा हूँ।" },
};

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const text = String(body.text || "").trim().slice(0, 300);
  if (!text) return NextResponse.json({ error: "Kuch bolkar dekhiye" }, { status: 400 });

  await connectDB();
  const [products, customers] = await Promise.all([
    Product.find({ shopId: user.shopId }).select("name unit stock lowStockLimit").limit(200).lean(),
    Customer.find({ shopId: user.shopId }).select("name balance").limit(200).lean(),
  ]);
  const isOwner = user.role === "owner";

  const system = `You are the voice assistant of "Vyapar Setu", a shop app for Indian kirana shopkeepers. The shopkeeper speaks Hindi or Hinglish. Understand the request and reply ONLY with JSON in this shape:
{"intent": "check_stock" | "low_stock" | "today_sales" | "udhaar_total" | "udhaar_customer" | "navigate" | "unknown", "product": string or null, "customer": string or null, "page": "billing" | "products" | "udhaar" | "reports" | "dashboard" | null}

Rules:
- "product" must be EXACTLY one of these product names, or null if none fits: ${JSON.stringify(products.map((p: any) => p.name))}. Map Hindi/Hinglish words to the closest product (chawal = rice, tel = oil, cheeni = sugar, atta = flour, namak = salt, dal = lentils).
- "customer" must be EXACTLY one of these names, or null: ${JSON.stringify(customers.map((c: any) => c.name))}
- check_stock: asks how much of an item is left.
- low_stock: asks which items are low or finishing.
- today_sales: asks about today's sales or earnings (bikri, kamai).
- udhaar_total: asks total credit pending. udhaar_customer: asks how much one person owes.
- navigate: wants to open a screen or learn how to do something. Making a bill -> billing. Adding or seeing stock -> products. Receiving credit payments or the udhaar ledger -> udhaar. Reports -> reports. Home -> dashboard.
- Anything else: unknown.`;

  let intent: any;
  try {
    intent = await chatJSON(system, text);
  } catch (e) {
    console.error("Groq error:", e);
    return NextResponse.json({ reply: "माफ़ कीजिए, अभी समझ नहीं पाया। फिर से बोलिए।" });
  }

  const product: any = products.find((p: any) => p.name === intent.product);
  const customer: any = customers.find((c: any) => c.name === intent.customer);
  let reply = "";
  let navigate: string | undefined;

  switch (intent.intent) {
    case "check_stock": {
      if (!product) {
        reply = "यह सामान मुझे नहीं मिला। सामान का नाम फिर से बोलिए।";
      } else if (product.stock === 0) {
        reply = `${product.name} खत्म हो गया है।`;
      } else {
        reply = `${product.name} का ${product.stock} ${unitHi[product.unit] || product.unit} स्टॉक बचा है।`;
        if (product.stock <= product.lowStockLimit) reply += " यह कम है, जल्दी मंगवा लीजिए।";
      }
      break;
    }
    case "low_stock": {
      const low: any[] = products.filter((p: any) => p.stock <= p.lowStockLimit);
      reply =
        low.length === 0
          ? "सब सामान ठीक है, कुछ भी कम नहीं है।"
          : `${low.length} सामान कम हैं: ${low.slice(0, 5).map((p) => p.name).join(", ")}।`;
      break;
    }
    case "today_sales": {
      if (!isOwner) {
        reply = OWNER_ONLY;
        break;
      }
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const sales: any[] = await Sale.find({ shopId: user.shopId, createdAt: { $gte: start } })
        .select("total")
        .lean();
      const total = sales.reduce((s, x) => s + x.total, 0);
      reply =
        sales.length === 0
          ? "आज अभी तक कोई बिक्री नहीं हुई।"
          : `आज अब तक ${sales.length} बिल बने और कुल ${total} रुपये की बिक्री हुई।`;
      break;
    }
    case "udhaar_total": {
      if (!isOwner) {
        reply = OWNER_ONLY;
        break;
      }
      const total = customers.reduce((s: number, c: any) => s + c.balance, 0);
      const count = customers.filter((c: any) => c.balance > 0).length;
      reply = total === 0 ? "किसी का उधार बाकी नहीं है।" : `${count} लोगों का कुल ${total} रुपये उधार बाकी है।`;
      break;
    }
    case "udhaar_customer": {
      if (!isOwner) {
        reply = OWNER_ONLY;
        break;
      }
      reply = !customer
        ? "यह नाम मुझे उधार खाते में नहीं मिला।"
        : customer.balance === 0
        ? `${customer.name} का कोई उधार बाकी नहीं है।`
        : `${customer.name} का ${customer.balance} रुपये बाकी है।`;
      break;
    }
    case "navigate": {
      const pg = pages[intent.page];
      if (!pg) {
        reply = "मैं समझ नहीं पाया कि कौन सा पन्ना खोलना है।";
      } else if (pg.ownerOnly && !isOwner) {
        reply = OWNER_ONLY;
      } else {
        reply = pg.text;
        navigate = pg.path;
      }
      break;
    }
    default:
      reply =
        "माफ़ कीजिए, मैं समझ नहीं पाया। आप पूछ सकते हैं: चावल कितना बचा है, आज की बिक्री कितनी हुई, या बिल कैसे बनाएं।";
  }

  return NextResponse.json({ reply, navigate });
}