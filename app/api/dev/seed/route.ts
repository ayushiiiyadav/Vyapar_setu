import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { getUser } from "@/lib/auth";
import Product from "@/models/product";
import Customer from "@/models/customer";
import Sale from "@/models/sale";
import Payment from "@/models/payment";
import Purchase from "@/models/purchase";
import { CATALOG, catalogLabel, productName } from "@/lib/catalog";

const DAY = 86400000;
const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const pickOne = <T>(arr: T[]): T => arr[rnd(0, arr.length - 1)];

// days until expiry for short-life items (negative = already expired)
const PERISH: Record<string, number> = {
  Milk: 2,
  "Taaza Milk": 3,
  "Curd (Dahi)": 4,
  Bread: -1,
  Eggs: 10,
  Paneer: 6,
};

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production")
    return NextResponse.json({ error: "Demo data is disabled in production" }, { status: 403 });
  const user = getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const shopId = new mongoose.Types.ObjectId(user.shopId);
  const userId = new mongoose.Types.ObjectId(user.id);

  // 1. Clear this shop's existing data
  const models: any[] = [Product, Customer, Sale, Payment, Purchase];
  await Promise.all(models.map((M) => M.deleteMany({ shopId })));

  // 2. Products
  const chosen = CATALOG.filter((it, idx) => idx % 3 === 0 || it.en in PERISH);
  const priceFor = (u: string) =>
    u === "kg" ? rnd(30, 180) : u === "litre" ? rnd(60, 180) : u === "packet" ? rnd(10, 120) : rnd(5, 60);

  const productDocs = chosen.map((it, i) => {
    const price = priceFor(it.unit);
    const stock = i % 7 === 3 ? 0 : i % 5 === 0 ? 3 : rnd(15, 80);
    const days = PERISH[it.en];
    return {
      shopId,
      name: productName(it),
      unit: it.unit,
      price,
      costPrice: Math.round(price * 0.8),
      stock,
      lowStockLimit: 5,
      expiryDate: days === undefined ? undefined : new Date(Date.now() + days * DAY),
      brand: it.brand ?? "",
      icon: it.icon,
      keys: it.aka ?? "",
      names: {
        en: productName(it),
        hi: catalogLabel(it, "hi"),
        mr: catalogLabel(it, "mr"),
        te: catalogLabel(it, "te"),
      },
    };
  });
  const products: any[] = await Product.insertMany(productDocs);

  // 3. Customers (udhaar)
  const names = ["Sharma Ji", "Patil Kaka", "Reddy Garu", "Gupta Aunty"];
  const customers: any[] = await Customer.insertMany(
  names.map((name) => ({ shopId, name, phone: "", balance: 0 }))    );
  const balances = new Map<string, number>();
  customers.forEach((c) => balances.set(String(c._id), 0));

  // 4. Sales over the last 14 days (a few today so reports look alive)
  const stocked = products.filter((p) => p.stock > 0);
  const sales = Array.from({ length: 45 }, (_, idx) => {
    const when =
      idx < 4
        ? new Date(Date.now() - rnd(0, 5) * 3600000)
        : new Date(Date.now() - rnd(0, 13) * DAY - rnd(0, 10) * 3600000);
    const items = Array.from({ length: rnd(1, 4) }, () => {
      const p = pickOne(stocked);
      return { productId: p._id, name: p.name, price: p.price, qty: rnd(1, 5) };
    });
    const total = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const credit = Math.random() < 0.25;
    const customer = credit ? pickOne(customers) : null;
    if (customer) balances.set(String(customer._id), (balances.get(String(customer._id)) || 0) + total);
    return {
      shopId,
      items,
      total,
      paymentType: credit ? "credit" : "cash",
      ...(customer ? { customerId: customer._id } : {}),
      createdBy: userId,
      createdAt: when,
      updatedAt: when,
    };
  });
  await Sale.collection.insertMany(sales as any[]);

  // 5. A few partial payments
  const payments: any[] = [];
  customers.forEach((c) => {
    const bal = balances.get(String(c._id)) || 0;
    if (bal > 300) {
      const when = new Date(Date.now() - 2 * DAY);
      payments.push({ shopId, customerId: c._id, amount: 100, receivedBy: userId, createdAt: when, updatedAt: when });
      balances.set(String(c._id), bal - 100);
    }
  });
  if (payments.length) await Payment.collection.insertMany(payments);
  await Promise.all(
    customers.map((c) => Customer.updateOne({ _id: c._id }, { balance: balances.get(String(c._id)) || 0 }))
  );

  // 6. Supplier purchases
  const suppliers = ["Gupta Traders", "Metro Distributors", "Sharma Wholesale"];
  const purchases = suppliers.map((supplier, i) => {
    const items = products.slice(i * 4, i * 4 + 4).map((p) => ({
      productId: p._id,
      name: p.name,
      qty: rnd(10, 40),
      costPrice: Math.round(p.price * 0.8),
    }));
    const when = new Date(Date.now() - (i + 1) * 3 * DAY);
    return {
      shopId,
      supplier,
      items,
      total: items.reduce((sum, it) => sum + it.qty * it.costPrice, 0),
      createdBy: userId,
      createdAt: when,
      updatedAt: when,
    };
  });
  await Purchase.collection.insertMany(purchases as any[]);

  return NextResponse.json({
    products: products.length,
    customers: customers.length,
    sales: sales.length,
    payments: payments.length,
    purchases: purchases.length,
  });
}