const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { normalizePhone } = require("../utils/phone");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    address: { type: String, trim: true },
    profileUrl: { type: String },
    aadhaarUrl: { type: String },
    panUrl: { type: String },
    signatureUrl: { type: String },
    documents: [{ type: String }],
    notes: { type: String }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.pre("save", async function nextHook(next) {
  if (this.isModified("phone")) {
    this.phone = normalizePhone(this.phone);
  }
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
