const express = require("express");
const auth = require("../middleware/auth");
const { pay, history } = require("../controllers/paymentController");

const router = express.Router();

router.post("/pay", auth, pay);
router.get("/history", auth, history);

module.exports = router;
