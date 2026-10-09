import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Customer from "@/models/customer";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const customers = await Customer.find({ shopId: user.shopId }).sort({ name: 1 });
  return NextResponse.json({ customers });
}