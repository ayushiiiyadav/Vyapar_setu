import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Issue from "@/models/issue";

const TYPES = ["bug", "idea", "other"];

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const issues = await Issue.find({ shopId: user.shopId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("type message status createdAt");
  return NextResponse.json({ issues });
}

export async function POST(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const message = String(body.message || "").trim().slice(0, 1000);
  const type = TYPES.includes(body.type) ? body.type : "other";
  if (message.length < 5)
    return NextResponse.json({ error: "Message too short" }, { status: 400 });

  await connectDB();
  const recent = await Issue.countDocuments({
    shopId: user.shopId,
    createdAt: { $gte: new Date(Date.now() - 86400000) },
  });
  if (recent >= 10) return NextResponse.json({ error: "Too many reports" }, { status: 429 });

  const issue = await Issue.create({ shopId: user.shopId, userId: user.id, type, message });
  return NextResponse.json(issue, { status: 201 });
}