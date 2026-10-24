import { Schema, models, model } from "mongoose";

const IssueSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["bug", "idea", "other"], default: "bug" },
    message: { type: String, required: true, maxlength: 1000 },
    status: { type: String, enum: ["open", "seen", "fixed"], default: "open" },
  },
  { timestamps: true }
);

export default models.Issue || model("Issue", IssueSchema);