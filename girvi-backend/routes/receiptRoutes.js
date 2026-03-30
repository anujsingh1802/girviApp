const express = require("express");
const router = express.Router();
const { getReceipt } = require("../controllers/receiptController");

// Public access for shared receipts if needed, or secure behind auth
// For WhatsApp sharing, we might want it public if we just share a link, but let's keep it under the same public auth strategy for now
router.get("/:transactionId", getReceipt);

module.exports = router;
