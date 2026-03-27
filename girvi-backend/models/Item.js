const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    images: [{ type: String }],
    estimatedValue: { type: Number, required: true, min: 0 },
    netWeight: { type: Number, default: 0 },
    grossWeight: { type: Number, default: 0 },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Item", itemSchema);
