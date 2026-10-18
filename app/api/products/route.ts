import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";
import { getUser } from "@/lib/auth";

const UNITS = ["kg", "litre", "pcs", "packet"];

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const search = (req.nextUrl.searchParams.get("search") || "").trim().slice(0, 60);
  const filter: any = { shopId: user.shopId };
  if (search) {
    const rx = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [
      { name: rx },
      { "names.hi": rx },
      { "names.mr": rx },
      { "names.te": rx },
      { keys: rx },
    ];
  }

  const products = await Product.find(filter).sort({ name: 1 }).limit(200);
  return NextResponse.json({ products, total: products.length, pages: 1 });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json();
  const name = String(b.name || "").trim().slice(0, 80);
  const price = Number(b.price);
  const stock = Number(b.stock ?? 0);
  const exp = b.expiryDate ? new Date(b.expiryDate) : null;
  if (!name || !(price >= 0) || !(stock >= 0) || (exp && isNaN(exp.getTime())))
    return NextResponse.json({ error: "Naam aur sahi daam likhiye" }, { status: 400 });

  const n = b.names && typeof b.names === "object" ? b.names : null;

  await connectDB();
  const product = await Product.create({
    shopId: user.shopId,
    name,
    unit: UNITS.includes(b.unit) ? b.unit : "pcs",
    price,
    stock,
    costPrice: Number(b.costPrice) >= 0 ? Number(b.costPrice) : 0,
    lowStockLimit: Number(b.lowStockLimit) >= 0 ? Number(b.lowStockLimit) : 5,
    ...(exp ? { expiryDate: exp } : {}),
    brand: String(b.brand || "").slice(0, 60),
    icon: String(b.icon || "").slice(0, 8),
    keys: String(b.keys || "").slice(0, 200),
    ...(n
      ? {
          names: {
            en: String(n.en || "").slice(0, 120),
            hi: String(n.hi || "").slice(0, 120),
            mr: String(n.mr || "").slice(0, 120),
            te: String(n.te || "").slice(0, 120),
          },
        }
      : {}),
  });
  return NextResponse.json(product, { status: 201 });
}