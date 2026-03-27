const Loan = require("../models/Loan");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const { calculateLoanSnapshot } = require("../services/loanCalculator");
const { createLedgerRecord } = require("../services/ledgerService");

const pay = asyncHandler(async (req, res) => {
  const { loanId, amount, releaseDate } = req.body;
  if (!loanId || !amount) {
    return res.status(400).json({ message: "loanId and amount are required" });
  }

  const loan = await Loan.findById(loanId).populate("userId", "phone name");
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  if (loan.userId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const previousPayments = await Transaction.find({ loanId: loan._id, type: "payment", status: "success" }).lean();
  
  const snapshot = calculateLoanSnapshot({
    principal: loan.loanAmount,
    interestRate: loan.interestRate,
    duration: loan.duration || loan.durationMonths || 1,
    durationUnit: loan.durationUnit || 'months',
    interestType: loan.interestType || 'simple',
    loanDate: loan.loanDate || loan.startDate || loan.createdAt,
    payments: [...previousPayments.map(p => ({ amount: p.amount, paymentDate: p.createdAt })), { amount, paymentDate: releaseDate || new Date() }]
  });

  const txn = await Transaction.create({
    userId: req.user._id,
    loanId: loan._id,
    amount,
    type: "payment",
    status: "success",
    createdAt: releaseDate || new Date()
  });

  if (snapshot.remainingBalance <= 0 && loan.status !== 'completed') {
    loan.status = 'completed';
  } else if (snapshot.isOverdue) {
    loan.status = 'defaulted';
  } else if (loan.status !== 'active') {
    loan.status = 'active';
  }

  loan.totalPayable = snapshot.totalPayable;
  if (!loan.duration) {
    loan.duration = loan.durationMonths || 1;
  }
  await loan.save();

  await createLedgerRecord({
    customer: loan.userId._id,
    loan: loan._id,
    transactionRef: txn._id,
    transactionDate: txn.createdAt,
    description: `Loan payment from ${loan.userId.name}`,
    credit: txn.amount,
    source: 'loan-payment'
  });

  res.json({ transaction: txn, loan });
});

const history = asyncHandler(async (req, res) => {
  const txns = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(txns);
});

const publicPay = asyncHandler(async (req, res) => {
  const { loanId, amount, releaseDate } = req.body;
  if (!loanId || !amount) {
    return res.status(400).json({ message: "loanId and amount are required" });
  }

  const loan = await Loan.findById(loanId).populate("userId", "phone name");
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  const previousPayments = await Transaction.find({ loanId: loan._id, type: "payment", status: "success" }).lean();
  
  const snapshot = calculateLoanSnapshot({
    principal: loan.loanAmount,
    interestRate: loan.interestRate,
    duration: loan.duration || loan.durationMonths || 1,
    durationUnit: loan.durationUnit || 'months',
    interestType: loan.interestType || 'simple',
    loanDate: loan.loanDate || loan.startDate || loan.createdAt,
    payments: [...previousPayments.map(p => ({ amount: p.amount, paymentDate: p.createdAt })), { amount, paymentDate: releaseDate ? new Date(releaseDate) : new Date() }]
  });

  const txn = await Transaction.create({
    userId: loan.userId._id,
    loanId: loan._id,
    amount,
    type: "payment",
    status: "success",
    createdAt: releaseDate ? new Date(releaseDate) : new Date()
  });

  if (snapshot.remainingBalance <= 0 && loan.status !== 'completed') {
    loan.status = 'completed';
  } else if (snapshot.isOverdue) {
    loan.status = 'defaulted';
  } else if (loan.status !== 'active') {
    loan.status = 'active';
  }

  loan.totalPayable = snapshot.totalPayable;
  if (!loan.duration) {
    loan.duration = loan.durationMonths || 1;
  }
  await loan.save();

  await createLedgerRecord({
    customer: loan.userId._id,
    loan: loan._id,
    transactionRef: txn._id,
    transactionDate: txn.createdAt,
    description: `Public Loan payment from ${loan.userId.name}`,
    credit: txn.amount,
    source: 'loan-payment'
  });

  res.json({ transaction: txn, loan });
});

const publicHistory = asyncHandler(async (req, res) => {
  const txns = await Transaction.find()
    .populate("userId", "name phone")
    .populate("loanId", "loanAmount status")
    .sort({ createdAt: -1 });
  res.json(txns);
});

module.exports = { pay, history, publicPay, publicHistory };
