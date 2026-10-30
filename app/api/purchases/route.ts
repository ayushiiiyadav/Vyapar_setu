import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Product from "@/models/product";
import Purchase from "@/models/purchase";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const items: any[] = Array.isArray(body.items) ? body.items : [];
  const supplier = String(body.supplier || "").trim().slice(0, 80);
  if (items.length === 0 || items.length > 50)
    return NextResponse.json({ error: "Maal ki list galat hai" }, { status: 400 });

  // 1. Validate every line before changing anything
  const lines: { productId: string; qty: number; cost: number; exp: Date | null }[] = [];
  for (const it of items) {
    const qty = Number(it.qty);
    const cost = it.costPrice === undefined || it.costPrice === "" ? 0 : Number(it.costPrice);
    const exp = it.expiryDate ? new Date(it.expiryDate) : null;
    if (!it.productId || !(qty > 0) || !(cost >= 0) || (exp && isNaN(exp.getTime())))
      return NextResponse.json({ error: "Maal ki jaankari galat hai" }, { status: 400 });
    lines.push({ productId: String(it.productId), qty, cost, exp });
  }

  await connectDB();
  let products: any[];
  try {
    products = await Product.find({
      _id: { $in: lines.map((l) => l.productId) },
      shopId: user.shopId,
    }).select("name");
  } catch {
    return NextResponse.json({ error: "Maal ki jaankari galat hai" }, { status: 400 });
  }
  if (products.length !== new Set(lines.map((l) => l.productId)).size)
    return NextResponse.json({ error: "Saman nahi mila" }, { status: 404 });

  // 2. Apply: stock goes up, cost price and expiry are updated if given
  const saved = [];
  let total = 0;
  for (const l of lines) {
    const set: Record<string, unknown> = {};
    if (l.cost > 0) set.costPrice = l.cost;
    if (l.exp) set.expiryDate = l.exp;
    const update: Record<string, unknown> = { $inc: { stock: l.qty } };
    if (Object.keys(set).length) update.$set = set;
    const p = await Product.findOneAndUpdate({ _id: l.productId, shopId: user.shopId }, update, { returnDocument: "after" });
    saved.push({ productId: l.productId, name: p?.name, qty: l.qty, costPrice: l.cost, expiryDate: l.exp });
    total += l.qty * l.cost;
  }

  const purchase = await Purchase.create({
    shopId: user.shopId,
    supplier,
    items: saved,
    total,
    createdBy: user.id,
  });
  return NextResponse.json(purchase, { status: 201 });
}

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const purchases = await Purchase.find({ shopId: user.shopId }).sort({ createdAt: -1 }).limit(30);
  return NextResponse.json({ purchases });
}