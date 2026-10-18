import { Schema, models, model } from "mongoose";

const PurchaseSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    supplier: { type: String, default: "" },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        qty: Number,
        costPrice: Number,
        expiryDate: Date,
      },
    ],
    total: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PurchaseSchema.index({ shopId: 1, createdAt: -1 });

export default models.Purchase || model("Purchase", PurchaseSchema);