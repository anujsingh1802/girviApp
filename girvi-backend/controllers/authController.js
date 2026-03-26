const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

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

const profile = asyncHandler(async (req, res) => {
  res.json(req.user);
});

module.exports = { register, login, profile };
