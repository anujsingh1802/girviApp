const Loan = require("../models/Loan");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { calculateLoanSnapshot } = require("../services/loanCalculator");
const { createLedgerRecord } = require("../services/ledgerService");

const applyLoan = asyncHandler(async (req, res) => {
  const { itemId, loanAmount, interestRate, duration, durationUnit, interestType } = req.body;

  if (!itemId || !loanAmount || !interestRate || !duration) {
    return res.status(400).json({ message: "itemId, loanAmount, interestRate, duration are required" });
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
    duration,
    durationUnit: durationUnit || 'months',
    interestType: interestType || 'simple',
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

    return res.json(loan);
  }

  loan.status = "active";
  loan.loanDate = new Date();
  loan.startDate = new Date();

  // Snapshot calculation for total payable initially
  const snapshot = calculateLoanSnapshot({
    principal: loan.loanAmount,
    interestRate: loan.interestRate,
    duration: loan.duration,
    durationUnit: loan.durationUnit,
    interestType: loan.interestType,
    loanDate: loan.loanDate,
    payments: []
  });
  
  loan.totalPayable = snapshot.totalPayable;
  loan.endDate = snapshot.dueDate;
  await loan.save();

  const txn = await Transaction.create({
    userId: loan.userId._id,
    loanId: loan._id,
    amount: loan.loanAmount,
    type: "loan_disbursed",
    status: "success"
  });

  await createLedgerRecord({
    customer: loan.userId._id,
    loan: loan._id,
    transactionRef: txn._id,
    transactionDate: txn.createdAt,
    description: `Loan disbursement for ${loan.userId.name}`,
    debit: loan.loanAmount,
    source: 'loan-disbursement'
  });

  res.json(loan);
});

const publicApplyLoan = asyncHandler(async (req, res) => {
  const { customerId, itemName, category, description, estimatedValue, loanAmount, disbursedAmount, interestRate, duration, durationUnit, interestType, loanDate, netWeight, grossWeight, images } = req.body;

  if (!customerId || !itemName || !category || !loanAmount || !interestRate || !duration) {
    return res.status(400).json({ message: "customerId, itemName, category, loanAmount, interestRate, duration are required" });
  }

  const user = await User.findById(customerId);
  if (!user) return res.status(404).json({ message: "Customer not found" });

  const item = await Item.create({
    userId: customerId,
    itemName,
    category,
    description,
    images: images && images.length > 0 ? images : [],
    estimatedValue: typeof estimatedValue === "number" ? estimatedValue : loanAmount,
    netWeight: netWeight ? Number(netWeight) : 0,
    grossWeight: grossWeight ? Number(grossWeight) : 0,
    status: "pending"
  });

  let parsedDate = loanDate ? new Date(loanDate) : new Date();

  const dummyLoan = new Loan({
    loanAmount: Number(loanAmount),
    interestRate: Number(interestRate),
    duration: Number(duration),
    durationUnit: durationUnit || 'months',
    interestType: interestType || 'simple',
    loanDate: parsedDate,
  });

  const snapshot = calculateLoanSnapshot({
    principal: dummyLoan.loanAmount,
    interestRate: dummyLoan.interestRate,
    duration: dummyLoan.duration,
    durationUnit: dummyLoan.durationUnit,
    interestType: dummyLoan.interestType,
    loanDate: dummyLoan.loanDate,
    payments: []
  });

  const loan = await Loan.create({
    userId: customerId,
    itemId: item._id,
    loanAmount: dummyLoan.loanAmount,
    interestRate: dummyLoan.interestRate,
    duration: dummyLoan.duration,
    durationUnit: dummyLoan.durationUnit,
    interestType: dummyLoan.interestType,
    netWeight: item.netWeight,
    grossWeight: item.grossWeight,
    status: "active",
    loanDate: dummyLoan.loanDate,
    startDate: dummyLoan.loanDate,
    endDate: snapshot.dueDate,
    totalPayable: snapshot.totalPayable
  });

  const actualDisbursed = disbursedAmount ? Number(disbursedAmount) : dummyLoan.loanAmount;

  const txn = await Transaction.create({
    userId: customerId,
    loanId: loan._id,
    amount: actualDisbursed,
    type: "loan_disbursed",
    status: "success",
    createdAt: dummyLoan.loanDate
  });

  await createLedgerRecord({
    customer: customerId,
    loan: loan._id,
    transactionRef: txn._id,
    transactionDate: txn.createdAt,
    description: `Public Loan application for ${user.name}`,
    debit: actualDisbursed,
    source: 'loan-disbursement'
  });

  res.status(201).json({ loan, item });
});

const getAllLoansPublic = asyncHandler(async (req, res) => {
  const loans = await Loan.find()
    .populate("userId", "name email phone")
    .populate("itemId", "itemName category")
    .sort({ createdAt: -1 });

  const rawPayments = await Transaction.find({ type: "payment", status: "success" }).lean();
  
  const paymentMap = rawPayments.reduce((acc, txn) => {
    const key = String(txn.loanId);
    acc[key] = acc[key] || [];
    acc[key].push({ amount: txn.amount, paymentDate: txn.createdAt });
    return acc;
  }, {});

  const enriched = loans.map((loan) => {
    const loanPayments = paymentMap[String(loan._id)] || [];
    
    const snapshot = calculateLoanSnapshot({
      principal: loan.loanAmount,
      interestRate: loan.interestRate,
      duration: loan.duration || loan.durationMonths || 1, // Fallback for old schema
      durationUnit: loan.durationUnit || 'months',
      interestType: loan.interestType || 'simple',
      loanDate: loan.loanDate || loan.startDate || loan.createdAt,
      payments: loanPayments
    });

    let dynamicStatus = loan.status;
    if (snapshot.remainingBalance <= 0 && snapshot.totalPayable > 0) {
      dynamicStatus = "completed";
    }

    return {
      ...loan.toObject(),
      totalPayable: snapshot.totalPayable,
      paidTotal: snapshot.paidAmount,
      remaining: snapshot.remainingBalance,
      interest: snapshot.interestEarned,
      status: dynamicStatus
    };
  });

  res.json(enriched);
});

const getDashboardSummary = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const currentDate = new Date();

  const pipeline = [];

  if (category && category !== 'All' && category !== 'All Metals') {
    pipeline.push({
      $lookup: {
        from: 'items',
        localField: 'itemId',
        foreignField: '_id',
        as: 'itemDetails'
      }
    });
    pipeline.push({
      $unwind: { path: '$itemDetails', preserveNullAndEmptyArrays: false }
    });
    pipeline.push({
      $match: { 'itemDetails.category': category }
    });
  }

  pipeline.push({
    $group: {
      _id: null,
      totalPrincipal: {
        $sum: { $toDouble: { $ifNull: ["$principalAmount", { $ifNull: ["$loanAmount", 0] }] } }
      },
      activePrincipal: {
        $sum: {
          $cond: [
            { $eq: ["$status", "active"] },
            { $toDouble: { $ifNull: ["$principalAmount", { $ifNull: ["$loanAmount", 0] }] } },
            0
          ]
        }
      },
      overduePrincipal: {
        $sum: {
          $cond: [
            {
              $and: [
                { $eq: ["$status", "active"] },
                { $ne: [{ $ifNull: ["$endDate", null] }, null] },
                { $lt: ["$endDate", currentDate] }
              ]
            },
            { $toDouble: { $ifNull: ["$principalAmount", { $ifNull: ["$loanAmount", 0] }] } },
            0
          ]
        }
      },
      totalNetWeight: {
        $sum: { $toDouble: { $ifNull: ["$netWeight", 0] } }
      },
      totalGrossWeight: {
        $sum: { $toDouble: { $ifNull: ["$grossWeight", 0] } }
      }
    }
  });

  const summary = await Loan.aggregate(pipeline);

  if (!summary || summary.length === 0) {
    return res.status(200).json({
      principal: { total: 0, active: 0, overdue: 0 },
      weight: { net: 0, gross: 0 }
    });
  }

  const data = summary[0];

  return res.status(200).json({
    principal: {
      total: Number(data.totalPrincipal) || 0,
      active: Number(data.activePrincipal) || 0,
      overdue: Number(data.overduePrincipal) || 0
    },
    weight: {
      net: Number(data.totalNetWeight) || 0,
      gross: Number(data.totalGrossWeight) || 0
    }
  });
});

const deleteLoan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const loan = await Loan.findById(id);
  
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  const transactions = await Transaction.find({ loanId: id, type: 'payment', status: 'success' });
  const snapshot = calculateLoanSnapshot({
    principal: loan.loanAmount,
    interestRate: loan.interestRate,
    duration: loan.duration || 1,
    durationUnit: loan.durationUnit || 'months',
    interestType: loan.interestType || 'simple',
    loanDate: loan.loanDate || loan.startDate || loan.createdAt,
    payments: transactions.map(t => ({ amount: t.amount, paymentDate: t.createdAt }))
  });

  let dynamicStatus = loan.status;
  if (snapshot.remainingBalance <= 0 && snapshot.totalPayable > 0) {
    dynamicStatus = "completed";
  }

  if (dynamicStatus !== 'completed') {
    return res.status(400).json({ message: "Only completed loans can be deleted" });
  }

  await Transaction.deleteMany({ loanId: id });
  if (loan.itemId) {
    await Item.findByIdAndDelete(loan.itemId);
  }
  await loan.deleteOne();

  res.json({ message: "Loan and associated records deleted successfully" });
});

module.exports = { applyLoan, getUserLoans, getAllLoans, approveLoan, publicApplyLoan, getAllLoansPublic, getDashboardSummary, deleteLoan };
