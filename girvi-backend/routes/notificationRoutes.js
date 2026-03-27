const express = require("express");
const { getNotificationsAndSettings, updateNotificationInterval, markNotificationRead } = require("../controllers/notificationController");
const router = express.Router();

router.get("/", getNotificationsAndSettings);
router.put("/settings", updateNotificationInterval);
router.put("/:id/read", markNotificationRead);

module.exports = router;
