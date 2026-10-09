import { Schema, models, model } from "mongoose";

const SaleSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        qty: Number,
      },
    ],
    total: { type: Number, required: true },
    paymentType: { type: String, enum: ["cash", "credit"], required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

SaleSchema.index({ shopId: 1, createdAt: -1 });

export default models.Sale || model("Sale", SaleSchema);