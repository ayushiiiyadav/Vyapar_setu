import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Customer from "@/models/customer";
import Payment from "@/models/payment";

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { customerId, amount } = await req.json();
  const amt = Number(amount);
  if (!customerId || !(amt > 0))
    return NextResponse.json({ error: "Sahi rakam likhiye" }, { status: 400 });

  await connectDB();
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, shopId: user.shopId, balance: { $gte: amt } },
    { $inc: { balance: -amt } },
    { returnDocument: "after" }
  );
  if (!customer)
    return NextResponse.json({ error: "Rakam baaki se zyada hai ya customer nahi mila" }, { status: 400 });

  await Payment.create({ shopId: user.shopId, customerId, amount: amt, receivedBy: user.id });
  return NextResponse.json({ customer });
}