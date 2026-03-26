const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    loanAmount: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0 },
    durationMonths: { type: Number, required: true, min: 1 },
    totalPayable: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "defaulted", "rejected"],
      default: "pending"
    },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Loan", loanSchema);
