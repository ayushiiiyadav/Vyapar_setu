import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/product";
import { getUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

// Edit product (owner only)
export async function PUT(req: NextRequest, { params }: Ctx) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner")
    return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  delete body.shopId; // never let the client change this

  await connectDB();
  const product = await Product.findOneAndUpdate(
    { _id: id, shopId: user.shopId },
    body,
    { new: true, runValidators: true }
  );
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// Delete product (owner only)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner")
    return NextResponse.json({ error: "Owner only" }, { status: 403 });

  const { id } = await params;
  await connectDB();
  const result = await Product.findOneAndDelete({ _id: id, shopId: user.shopId });
  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ deleted: true });
}