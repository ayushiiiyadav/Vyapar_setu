import { Schema, models, model } from "mongoose";

const PaymentSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    amount: { type: Number, required: true, min: 1 },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default models.Payment || model("Payment", PaymentSchema);