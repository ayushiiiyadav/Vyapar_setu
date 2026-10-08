import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  await connectDB();
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

  const token = signToken({
    id: user._id.toString(),
    role: user.role,
    shopId: (user.shopId || user._id).toString(),
  });
  return NextResponse.json({
    token,
    user: { name: user.name, shopName: user.shopName, role: user.role },
  });
}