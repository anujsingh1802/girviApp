const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  ownerNotificationIntervalDays: {
    type: Number,
    default: 2
  },
  lastOwnerNotificationDate: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Setting', settingSchema);
