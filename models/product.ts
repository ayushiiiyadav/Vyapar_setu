import { Schema, models, model } from "mongoose";

const ProductSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    unit: { type: String, default: "pcs" },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    lowStockLimit: { type: Number, default: 5 },
    expiryDate: { type: Date },
    brand: { type: String, default: "" },
    icon: { type: String, default: "" },
    keys: { type: String, default: "" },
    names: { en: String, hi: String, mr: String, te: String },
  },
  { timestamps: true }
);

export default models.Product || model("Product", ProductSchema);