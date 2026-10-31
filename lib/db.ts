import dns from "node:dns";
import mongoose from "mongoose";

// Some networks refuse the SRV lookup Atlas needs. Set MONGO_DNS_FIX=1 in .env.local to bypass.
if (process.env.MONGO_DNS_FIX === "1") {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const uri = process.env.MONGODB_URI as string;
const cached = (global as any).mongoose || { conn: null, promise: null };
(global as any).mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise ||= mongoose.connect(uri).catch((e) => {
    cached.promise = null; // allow a retry after a failure
    throw e;
  });
  cached.conn = await cached.promise;
  return cached.conn;
}