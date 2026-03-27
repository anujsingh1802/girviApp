const cron = require("node-cron");
const Loan = require("../models/Loan");
const Setting = require("../models/Setting");
const Notification = require("../models/Notification");

const startReminderCron = () => {
  cron.schedule("0 9 * * *", async () => {
    try {
      const now = new Date();
      const soon = new Date();
      soon.setDate(soon.getDate() + 3);

      const upcoming = await Loan.find({
        status: "active",
        endDate: { $gte: now, $lte: soon }
      }).populate("userId", "phone");

      for (const loan of upcoming) {
        // Notification logic if needed, but WhatsApp removed
      }

      const overdue = await Loan.find({
        status: "active",
        endDate: { $lt: now }
      }).populate("userId", "phone");

      for (const loan of overdue) {
        loan.status = "defaulted";
        await loan.save();
      }

      // Owner Notification Logic
      let settings = await Setting.findOne();
      if (!settings) settings = await Setting.create({ ownerNotificationIntervalDays: 2 });
      
      const intervalDays = settings.ownerNotificationIntervalDays || 2;
      const lastNotified = settings.lastOwnerNotificationDate || new Date(0);
      const daysSinceLast = (now - lastNotified) / (1000 * 3600 * 24);
      
      if (daysSinceLast >= intervalDays && overdue.length > 0) {
          const customerNames = Array.from(new Set(overdue.map(l => l.userId?.name || 'Customer'))).join(', ');
          
          await Notification.create({
              title: `${overdue.length} Pending Dues Alert`,
              message: `You have ${overdue.length} overdue loans pending today. Check clients: ${customerNames}`
          });
          
          settings.lastOwnerNotificationDate = now;
          await settings.save();
      }

    } catch (err) {
      console.error("Cron reminder failed:", err.message);
    }
  });
};

module.exports = startReminderCron;
