const Notification = require("../models/Notification");
const Setting = require("../models/Setting");
const asyncHandler = require("../utils/asyncHandler");

const getNotificationsAndSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({ ownerNotificationIntervalDays: 2 });
  }

  const notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);

  res.status(200).json({
    settings: {
      intervalDays: settings.ownerNotificationIntervalDays
    },
    notifications
  });
});

const updateNotificationInterval = asyncHandler(async (req, res) => {
  const { intervalDays } = req.body;
  if (!intervalDays || intervalDays < 1) {
    return res.status(400).json({ message: "Interval days must be at least 1" });
  }

  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({ ownerNotificationIntervalDays: intervalDays });
  } else {
    settings.ownerNotificationIntervalDays = intervalDays;
    await settings.save();
  }

  res.status(200).json({ message: "Interval updated successfully", intervalDays: settings.ownerNotificationIntervalDays });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  res.status(200).json(notification);
});

module.exports = { getNotificationsAndSettings, updateNotificationInterval, markNotificationRead };
