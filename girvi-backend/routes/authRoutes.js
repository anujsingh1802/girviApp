const express = require("express");
const {
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
} = require("../controllers/authController");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/otp/request", requestOtp);
router.post("/otp/verify", verifyOtp);
router.get("/profile", auth, profile);
router.post("/customer", createCustomer);
router.get("/customers", getCustomers);
router.get("/customer/:id", getCustomerProfile);
router.get("/user/:id/summary", getUserSummary);
router.patch("/customer/:id", updateCustomer);
router.delete("/customer/:id", deleteCustomer);

module.exports = router;
