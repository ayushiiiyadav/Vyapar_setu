import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/products";
import { getUser } from "@/lib/auth";

// List products (owner + staff). Supports ?search=rice&page=1
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const search = req.nextUrl.searchParams.get("search") || "";
  const page = Number(req.nextUrl.searchParams.get("page") || 1);
  const limit = 20;

  const filter: any = { shopId: user.shopId };
  if (search) filter.name = { $regex: search, $options: "i" };

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  return NextResponse.json({ products, total, pages: Math.ceil(total / limit) });
}

// Add product (owner only)
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner")
    return NextResponse.json({ error: "Only the owner can add products" }, { status: 403 });

  const body = await req.json();
  if (!body.name || body.price == null || body.price < 0)
    return NextResponse.json({ error: "Name and a valid price are required" }, { status: 400 });
  if (body.stock < 0)
    return NextResponse.json({ error: "Stock cannot be negative" }, { status: 400 });

  await connectDB();
  const product = await Product.create({ ...body, shopId: user.shopId });
  return NextResponse.json(product, { status: 201 });
}