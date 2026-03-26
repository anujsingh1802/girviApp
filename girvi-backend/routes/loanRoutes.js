const express = require("express");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const { applyLoan, getUserLoans, getAllLoans, approveLoan } = require("../controllers/loanController");

const router = express.Router();

router.post("/apply", auth, applyLoan);
router.get("/user", auth, getUserLoans);
router.get("/all", auth, adminOnly, getAllLoans);
router.put("/approve", auth, adminOnly, approveLoan);

module.exports = router;
