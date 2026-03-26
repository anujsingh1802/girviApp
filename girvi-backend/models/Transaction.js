const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    loanId: { type: mongoose.Schema.Types.ObjectId, ref: "Loan", required: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["loan_disbursed", "payment"], required: true },
    status: { type: String, enum: ["success", "failed"], default: "success" }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("Transaction", transactionSchema);
