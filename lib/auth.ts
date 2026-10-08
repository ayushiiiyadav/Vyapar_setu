import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const secret = process.env.JWT_SECRET as string;

export function signToken(payload: { id: string; role: string; shopId: string }) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return null;
  try {
    return jwt.verify(token, secret) as { id: string; role: string; shopId: string };
  } catch {
    return null;
  }
}