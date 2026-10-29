import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Sale from "@/models/sale";
import Product from "@/models/product";
import Customer from "@/models/customer";

export async function GET(req: NextRequest) {
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "owner")
    return NextResponse.json({ error: "Sirf malik report dekh sakta hai" }, { status: 403 });

  await connectDB();
  const shopId = new mongoose.Types.ObjectId(user.shopId); // aggregate() needs a real ObjectId

  const DAY = 86400000;
  const now = Date.now();
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0));
  const since = (days: number) => new Date(now - days * DAY);

  const sumSince = async (from: Date) => {
    const r = await Sale.aggregate([
      { $match: { shopId, createdAt: { $gte: from } } },
      { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } },
    ]);
    return { total: r[0]?.total || 0, count: r[0]?.count || 0 };
  };

  // Every sold item line, with the product's current cost price attached.
  // Items with no cost price are flagged (hasCost = false) so they are left out of profit.
  const soldLines = (from: Date): any[] => [
    { $match: { shopId, createdAt: { $gte: from } } },
    { $unwind: "$items" },
    {
      $lookup: {
        from: Product.collection.name,
        localField: "items.productId",
        foreignField: "_id",
        as: "prod",
      },
    },
    {
      $addFields: {
        cost: { $ifNull: [{ $arrayElemAt: ["$prod.costPrice", 0] }, 0] },
        line: { $multiply: ["$items.price", "$items.qty"] },
      },
    },
    { $addFields: { hasCost: { $gt: ["$cost", 0] } } },
    {
      $addFields: {
        lineProfit: {
          $cond: ["$hasCost", { $multiply: [{ $subtract: ["$items.price", "$cost"] }, "$items.qty"] }, 0],
        },
      },
    },
  ];

  // Profit and margin (profit as % of the sales that have a known cost)
  const profitSince = async (from: Date) => {
    const r = await Sale.aggregate([
      ...soldLines(from),
      {
        $group: {
          _id: null,
          profit: { $sum: "$lineProfit" },
          costedSales: { $sum: { $cond: ["$hasCost", "$line", 0] } },
        },
      },
    ]);
    const profit = r[0]?.profit || 0;
    const costedSales = r[0]?.costedSales || 0;
    return {
      profit: Math.round(profit),
      margin: costedSales > 0 ? Math.round((profit / costedSales) * 1000) / 10 : 0,
    };
  };

  const [today, week, month, dailyRaw, split, top, soldIds, low, udhaar] = await Promise.all([
    sumSince(startOfToday),
    sumSince(since(7)),
    sumSince(since(30)),
    Sale.aggregate([
      { $match: { shopId, createdAt: { $gte: since(7) } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
          total: { $sum: "$total" },
        },
      },
    ]),
    Sale.aggregate([
      { $match: { shopId, createdAt: { $gte: since(30) } } },
      { $group: { _id: "$paymentType", total: { $sum: "$total" } } },
    ]),
    Sale.aggregate([
      { $match: { shopId, createdAt: { $gte: since(30) } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]),
    Sale.distinct("items.productId", { shopId, createdAt: { $gte: since(14) } }),
    Product.find({ shopId: user.shopId, $expr: { $lte: ["$stock", "$lowStockLimit"] } })
      .limit(10)
      .select("name stock unit"),
    Customer.aggregate([
      { $match: { shopId } },
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]),
  ]);

  const slow = await Product.find({ shopId: user.shopId, stock: { $gt: 0 }, _id: { $nin: soldIds } })
    .limit(5)
    .select("name stock unit");

  // Profit numbers
  const [profitToday, profitWeek, profitMonth, profitDailyRaw, byItem] = await Promise.all([
    profitSince(startOfToday),
    profitSince(since(7)),
    profitSince(since(30)),
    Sale.aggregate([
      ...soldLines(since(7)),
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Kolkata" } },
          profit: { $sum: "$lineProfit" },
        },
      },
    ]),
    Sale.aggregate([
      ...soldLines(since(30)),
      {
        $group: {
          _id: "$items.name",
          profit: { $sum: "$lineProfit" },
          qty: { $sum: "$items.qty" },
          hasCost: { $max: "$hasCost" },
        },
      },
    ]),
  ]);

  const topProfit = byItem
    .filter((x: any) => x.hasCost && x.profit > 0)
    .sort((a: any, b: any) => b.profit - a.profit)
    .slice(0, 5)
    .map((x: any) => ({ _id: x._id, qty: x.qty, profit: Math.round(x.profit) }));
  // Sold items whose cost price is missing: they are left out of profit
  const missingCost = byItem.filter((x: any) => !x.hasCost).map((x: any) => x._id).slice(0, 5);

  // Fill in all 7 days, including days with no sales
  const byDay = new Map(dailyRaw.map((d: any) => [d._id, d.total]));
  const profitByDay = new Map(profitDailyRaw.map((d: any) => [d._id, d.profit]));
  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * DAY);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
    return {
      day: d.toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" }),
      total: byDay.get(key) || 0,
      profit: Math.round(profitByDay.get(key) || 0),
    };
  });

  return NextResponse.json({
    today,
    week,
    month,
    daily,
    cash: split.find((s: any) => s._id === "cash")?.total || 0,
    credit: split.find((s: any) => s._id === "credit")?.total || 0,
    top,
    slow,
    low,
    udhaarPending: udhaar[0]?.total || 0,
    profit: { today: profitToday, week: profitWeek, month: profitMonth },
    topProfit,
    missingCost,
  });
}