import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/user";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, email, password, shopName } = await req.json();
  if (!name || !email || !password || !shopName)
    return NextResponse.json({ error: "All fields required" }, { status: 400 });

  await connectDB();
  if (await User.findOne({ email }))
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const user = await User.create({
    name,
    email,
    shopName,
    password: await bcrypt.hash(password, 10),
    role: "owner",
  });
  user.shopId = user._id;
  await user.save();

  const token = signToken({
    id: user._id.toString(),
    role: "owner",
    shopId: user._id.toString(),
  });
  return NextResponse.json({ token, user: { name, shopName, role: "owner" } });
}