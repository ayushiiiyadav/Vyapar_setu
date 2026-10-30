import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Product from "@/models/product";
import Sale from "@/models/sale";
import Customer from "@/models/customer";

// Create a sale: reduces stock, and adds to udhaar for credit sales
export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { items, paymentType, customerId, customerName, customerPhone } = await req.json();
  if (!Array.isArray(items) || items.length === 0)
    return NextResponse.json({ error: "Bill khali hai" }, { status: 400 });
  if (!["cash", "credit"].includes(paymentType))
    return NextResponse.json({ error: "Payment type galat hai" }, { status: 400 });

  await connectDB();

  const done: { id: string; qty: number }[] = [];
  const rollback = () =>
    Promise.all(done.map((d) => Product.updateOne({ _id: d.id }, { $inc: { stock: d.qty } })));

  try {
    // 1. Reduce stock for each item (only if enough stock exists)
    const saleItems = [];
    let total = 0;
    for (const it of items) {
      const qty = Number(it.qty);
      if (!it.productId || !(qty > 0)) {
        await rollback();
        return NextResponse.json({ error: "Item ya quantity galat hai" }, { status: 400 });
      }
      const p = await Product.findOneAndUpdate(
        { _id: it.productId, shopId: user.shopId, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { returnDocument: "after" }
      );
      if (!p) {
        await rollback();
        return NextResponse.json(
          { error: "Stock kam hai ya saman nahi mila" },
          { status: 400 }
        );
      }
      done.push({ id: p._id.toString(), qty });
      saleItems.push({ productId: p._id, name: p.name, price: p.price, qty });
      total += p.price * qty;
    }

    // 2. Udhaar: find or create the customer and add to their balance
    let customer = null;
    if (paymentType === "credit") {
      if (customerId) {
        customer = await Customer.findOne({ _id: customerId, shopId: user.shopId });
      } else if (customerName) {
        customer = await Customer.create({
          shopId: user.shopId,
          name: customerName,
          phone: customerPhone || "",
        });
      }
      if (!customer) {
        await rollback();
        return NextResponse.json({ error: "Udhaar ke liye customer chuniye" }, { status: 400 });
      }
      customer.balance += total;
      await customer.save();
    }

    // 3. Save the sale
    const sale = await Sale.create({
      shopId: user.shopId,
      items: saleItems,
      total,
      paymentType,
      customerId: customer?._id,
      createdBy: user.id,
    });

    return NextResponse.json(sale, { status: 201 });
  } catch {
    await rollback();
    return NextResponse.json({ error: "Bill nahi ban paya" }, { status: 400 });
  }
}

// Recent sales
export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const sales = await Sale.find({ shopId: user.shopId }).sort({ createdAt: -1 }).limit(50);
  return NextResponse.json({ sales });
}