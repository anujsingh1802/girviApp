const crypto = require("crypto");

const generateOtp = (length = 6) => {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

const hashOtp = (otp, secret = "") => {
  return crypto.createHash("sha256").update(`${otp}:${secret}`).digest("hex");
};

module.exports = { generateOtp, hashOtp };
