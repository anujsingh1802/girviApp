const express = require("express");
const { getDashboardSummary } = require("../controllers/loanController");

const router = express.Router();

router.get("/summary", getDashboardSummary);

module.exports = router;
