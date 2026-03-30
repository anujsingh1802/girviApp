const Transaction = require("../models/Transaction");
const Loan = require("../models/Loan");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { calculateLoanSnapshot } = require("../services/loanCalculator");

const getReceipt = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  const transaction = await Transaction.findById(transactionId);
  if (!transaction) return res.status(404).json({ message: "Transaction not found" });

  const loan = await Loan.findById(transaction.loanId).populate("itemId").populate("items");
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  const customer = await User.findById(transaction.userId).select("name phone address email");
  if (!customer) return res.status(404).json({ message: "Customer not found" });

  // Get all previous payments to calculate the exact state up to this transaction
  const allTransactions = await Transaction.find({ 
    loanId: loan._id, 
    type: "payment", 
    status: "success",
    createdAt: { $lte: transaction.createdAt }
  }).sort({ createdAt: 1 });

  const payments = allTransactions.map(t => ({ amount: t.amount, paymentDate: t.createdAt }));

  const snapshot = calculateLoanSnapshot({
    principal: loan.loanAmount,
    interestRate: loan.interestRate,
    duration: loan.duration || loan.durationMonths || 1,
    durationUnit: loan.durationUnit || 'months',
    interestType: loan.interestType || 'simple',
    loanDate: loan.loanDate || loan.startDate || loan.createdAt,
    payments
  });

  res.json({
    transaction,
    loan: {
      ...loan.toObject(),
      totalPayable: snapshot.totalPayable,
      paidTotal: snapshot.paidAmount,
      remaining: snapshot.remainingBalance,
      interestEarned: snapshot.interestEarned
    },
    customer
  });
});

module.exports = { getReceipt };
