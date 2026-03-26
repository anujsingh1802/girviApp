const Loan = require("../models/Loan");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");
const asyncHandler = require("../utils/asyncHandler");
const { sendWhatsAppMessage } = require("../utils/whatsapp");

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const applyLoan = asyncHandler(async (req, res) => {
  const { itemId, loanAmount, interestRate, durationMonths } = req.body;

  if (!itemId || !loanAmount || !interestRate || !durationMonths) {
    return res.status(400).json({ message: "itemId, loanAmount, interestRate, durationMonths are required" });
  }

  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });
  if (item.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const loan = await Loan.create({
    userId: req.user._id,
    itemId,
    loanAmount,
    interestRate,
    durationMonths,
    status: "pending"
  });

  res.status(201).json(loan);
});

const getUserLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find({ userId: req.user._id })
    .populate("itemId", "itemName category")
    .sort({ createdAt: -1 });
  res.json(loans);
});

const getAllLoans = asyncHandler(async (req, res) => {
  const loans = await Loan.find()
    .populate("userId", "name email phone")
    .populate("itemId", "itemName category")
    .sort({ createdAt: -1 });
  res.json(loans);
});

const approveLoan = asyncHandler(async (req, res) => {
  const { loanId, action } = req.body;
  if (!loanId || !action || !["approve", "reject"].includes(action)) {
    return res.status(400).json({ message: "loanId and action (approve/reject) are required" });
  }

  const loan = await Loan.findById(loanId).populate("userId", "name phone");
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  if (action === "reject") {
    loan.status = "rejected";
    await loan.save();

    sendWhatsAppMessage(loan.userId.phone, "? Your loan request has been rejected.");
    return res.json(loan);
  }

  // interestRate is expected as decimal (e.g., 0.12 for 12%) per formula
  const totalPayable = loan.loanAmount + (loan.loanAmount * loan.interestRate * loan.durationMonths) / 12;
  loan.totalPayable = totalPayable;
  loan.status = "active";
  loan.startDate = new Date();
  loan.endDate = addMonths(loan.startDate, loan.durationMonths);
  await loan.save();

  await Transaction.create({
    userId: loan.userId._id,
    loanId: loan._id,
    amount: loan.loanAmount,
    type: "loan_disbursed",
    status: "success"
  });

  sendWhatsAppMessage(loan.userId.phone, `?? Your loan of ?${loan.loanAmount} has been approved.`);

  res.json(loan);
});

module.exports = { applyLoan, getUserLoans, getAllLoans, approveLoan };
