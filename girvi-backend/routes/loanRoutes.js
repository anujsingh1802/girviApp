const express = require("express");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const { applyLoan, getUserLoans, getAllLoans, approveLoan, publicApplyLoan, getAllLoansPublic, deleteLoan } = require("../controllers/loanController");

const router = express.Router();

router.post("/apply", auth, applyLoan);
router.get("/user", auth, getUserLoans);
router.get("/all", auth, adminOnly, getAllLoans);
router.put("/approve", auth, adminOnly, approveLoan);
router.post("/public/apply", publicApplyLoan);
router.get("/public/all", getAllLoansPublic);
router.delete("/:id", deleteLoan);

module.exports = router;
