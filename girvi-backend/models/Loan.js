const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
    loanAmount: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    durationUnit: { type: String, enum: ['days', 'months', 'years'], default: 'months' },
    interestType: { type: String, enum: ['simple', 'compound', 'monthly', 'daily'], default: 'simple' },
    netWeight: { type: Number, default: 0 },
    grossWeight: { type: Number, default: 0 },
    totalPayable: { type: Number, default: 0 },
    loanDate: { type: Date, default: Date.now },
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
