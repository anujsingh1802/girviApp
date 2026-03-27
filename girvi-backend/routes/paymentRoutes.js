const express = require("express");
const auth = require("../middleware/auth");
const { pay, history, publicPay, publicHistory } = require("../controllers/paymentController");

const router = express.Router();

router.post("/pay", auth, pay);
router.get("/history", auth, history);
router.post("/public/pay", publicPay);
router.get("/public/history", publicHistory);

module.exports = router;
