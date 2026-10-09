import { Schema, models, model } from "mongoose";

const CustomerSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, default: "" },
    balance: { type: Number, default: 0 }, // udhaar: money the customer owes
  },
  { timestamps: true }
);

export default models.Customer || model("Customer", CustomerSchema);