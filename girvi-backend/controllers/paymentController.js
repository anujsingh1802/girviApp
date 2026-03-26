const Loan = require("../models/Loan");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const { sendWhatsAppMessage } = require("../utils/whatsapp");

const pay = asyncHandler(async (req, res) => {
  const { loanId, amount } = req.body;
  if (!loanId || !amount) {
    return res.status(400).json({ message: "loanId and amount are required" });
  }

  const loan = await Loan.findById(loanId).populate("userId", "phone");
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  if (loan.userId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const txn = await Transaction.create({
    userId: req.user._id,
    loanId,
    amount,
    type: "payment",
    status: "success"
  });

  const payments = await Transaction.aggregate([
    { $match: { loanId: loan._id, type: "payment", status: "success" } },
    { $group: { _id: "$loanId", total: { $sum: "$amount" } } }
  ]);

  const totalPaid = payments[0] ? payments[0].total : 0;
  if (loan.totalPayable > 0 && totalPaid >= loan.totalPayable) {
    loan.status = "completed";
    await loan.save();
  } else if (loan.endDate && loan.status === "active" && loan.endDate < new Date()) {
    loan.status = "defaulted";
    await loan.save();
  }

  sendWhatsAppMessage(loan.userId.phone, `? Payment of ?${amount} received successfully.`);

  res.json({ transaction: txn, loan });
});

const history = asyncHandler(async (req, res) => {
  const txns = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(txns);
});

module.exports = { pay, history };
