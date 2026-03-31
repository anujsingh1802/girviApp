const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Otp = require("../models/Otp");
const asyncHandler = require("../utils/asyncHandler");
const { normalizePhone } = require("../utils/phone");
const { generateOtp, hashOtp } = require("../utils/otp");
const Loan = require("../models/Loan");
const Item = require("../models/Item");
const Transaction = require("../models/Transaction");
const { calculateLoanSnapshot } = require("../services/loanCalculator");

const getUserSummary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "Customer not found" });

  const rawLoans = await Loan.find({ userId: id });
  const transactions = await Transaction.find({ userId: id, type: "payment", status: "success" });

  let principal = 0;
  let interest = 0;

  const paymentMap = transactions.reduce((acc, txn) => {
    const key = String(txn.loanId);
    acc[key] = acc[key] || [];
    acc[key].push({ amount: txn.amount, paymentDate: txn.createdAt });
    return acc;
  }, {});

  rawLoans.forEach(loan => {
    const loanPayments = paymentMap[String(loan._id)] || [];
    const snapshot = calculateLoanSnapshot({
      principal: loan.loanAmount,
      interestRate: loan.interestRate,
      duration: loan.duration || 1,
      durationUnit: loan.durationUnit || 'months',
      interestType: loan.interestType || 'simple',
      loanDate: loan.loanDate || loan.startDate || loan.createdAt,
      payments: loanPayments
    });

    principal += loan.loanAmount;
    interest += snapshot.interestEarned;
  });

  const totalPayable = principal + interest;
  const received = transactions.reduce((sum, txn) => sum + txn.amount, 0);
  let pending = totalPayable - received;
  if (pending < 0) pending = 0;

  res.json({
    principal,
    interest,
    totalPayable,
    received: received || 0,
    pending
  });
});

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
};

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const exists = await User.findOne({ $or: [{ email }, { phone }] });
  if (exists) {
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, phone, password });
  const token = signToken(user._id);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user._id);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
  });
});

const requestOtp = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone is required" });

  const normalized = normalizePhone(phone);

  const existing = await User.findOne({ phone: normalized });
  if (existing) {
    return res.status(409).json({ message: "User already exists" });
  }

  const otp = generateOtp(6);
  const ttlMinutes = Number(process.env.OTP_TTL_MINUTES || 5);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  const codeHash = hashOtp(otp, process.env.OTP_SECRET || "");

  await Otp.findOneAndUpdate(
    { phone: normalized },
    { phone: normalized, codeHash, expiresAt, attempts: 0 },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (process.env.OTP_LOG !== "false") {
    console.log(`OTP for ${normalized}: ${otp}`);
  }

  res.json({ message: "OTP sent", expiresInMinutes: ttlMinutes });
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp, name, email } = req.body;
  if (!phone || !otp || !name || !email) {
    return res.status(400).json({ message: "Phone, OTP, name, and email are required" });
  }

  const normalized = normalizePhone(phone);
  const record = await Otp.findOne({ phone: normalized });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: "OTP expired or invalid" });
  }

  const codeHash = hashOtp(String(otp), process.env.OTP_SECRET || "");
  if (codeHash !== record.codeHash) {
    const maxAttempts = Number(process.env.OTP_MAX_ATTEMPTS || 5);
    record.attempts += 1;
    await record.save();
    if (record.attempts >= maxAttempts) {
      await Otp.deleteOne({ _id: record._id });
    }
    return res.status(401).json({ message: "Invalid OTP" });
  }

  const exists = await User.findOne({ $or: [{ email }, { phone: normalized }] });
  if (exists) {
    await Otp.deleteOne({ _id: record._id });
    return res.status(409).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, phone: normalized });
  await Otp.deleteOne({ _id: record._id });

  const token = signToken(user._id);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
  });
});

const profile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const createCustomer = asyncHandler(async (req, res) => {
  const { name, email, phone, address, profileUrl, aadhaarUrl, panUrl, signatureUrl, documents, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: "Name and phone are required" });
  }

  const exists = await User.findOne({ phone });
  if (exists) {
    return res.status(409).json({ message: "Customer with this phone already exists" });
  }

  const user = await User.create({ 
    name, 
    email, 
    phone, 
    role: "user",
    address,
    profileUrl,
    aadhaarUrl,
    panUrl,
    signatureUrl,
    documents: documents || [],
    notes
  });

  res.status(201).json({ message: "Customer created successfully", customer: user });
});

const getCustomers = asyncHandler(async (req, res) => {
  const customers = await User.find({ role: "user" })
    .sort({ createdAt: -1 })
    .select("-password");
  res.json({ customers });
});

const getCustomerProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id).select("-password");
  if (!user) return res.status(404).json({ message: "Customer not found" });

  const items = await Item.find({ userId: id });
  const transactions = await Transaction.find({ userId: id }).sort({ createdAt: -1 });
  const rawLoans = await Loan.find({ userId: id }).populate("itemId").populate("items");

  const paymentMap = transactions.filter(t => t.type === "payment" && t.status === "success").reduce((acc, txn) => {
    const key = String(txn.loanId);
    acc[key] = acc[key] || [];
    acc[key].push({ amount: txn.amount, paymentDate: txn.createdAt });
    return acc;
  }, {});

  let totalPending = 0;

  const loans = rawLoans.map(loan => {
    const loanPayments = paymentMap[String(loan._id)] || [];
    const snapshot = calculateLoanSnapshot({
      principal: loan.loanAmount,
      interestRate: loan.interestRate,
      duration: loan.duration || 1,
      durationUnit: loan.durationUnit || 'months',
      interestType: loan.interestType || 'simple',
      loanDate: loan.loanDate || loan.startDate || loan.createdAt,
      payments: loanPayments
    });

    let dynamicStatus = loan.status;
    if (snapshot.remainingBalance <= 0 && snapshot.totalPayable > 0) {
      dynamicStatus = "completed";
    }

    if (dynamicStatus !== "completed" && dynamicStatus !== "rejected") {
      totalPending += snapshot.remainingBalance;
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

  res.json({
    customer: user,
    items,
    loans,
    transactions,
    totalPending
  });
});
const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user || user.role !== "user") {
    return res.status(404).json({ message: "Customer not found" });
  }

  const rawLoans = await Loan.find({ userId: id });
  const loanIds = rawLoans.map(l => l._id);
  
  await Transaction.deleteMany({ $or: [{ userId: id }, { loanId: { $in: loanIds } }] });
  await Item.deleteMany({ userId: id });
  await Loan.deleteMany({ userId: id });
  await Otp.deleteMany({ phone: user.phone });
  await user.deleteOne();

  res.json({ message: "Customer and all associated records deleted successfully" });
});

const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // We should not allow updating sensitive fields like role or phone (which is a unique identifier)
  delete updates.role;
  delete updates.password;
  
  if (updates.phone) {
     const exists = await User.findOne({ phone: updates.phone, _id: { $ne: id } });
     if (exists) return res.status(409).json({ message: "Phone number already in use by another customer" });
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: "Customer not found" });

  res.json({ message: "Customer updated successfully", customer: user });
});

module.exports = {
  register,
  login,
  requestOtp,
  verifyOtp,
  profile,
  createCustomer,
  getCustomers,
  getCustomerProfile,
  getUserSummary,
  deleteCustomer,
  updateCustomer
};
