const cron = require("node-cron");
const Loan = require("../models/Loan");
const { sendWhatsAppMessage } = require("../utils/whatsapp");

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
        sendWhatsAppMessage(loan.userId.phone, "? Reminder: Your EMI is due soon.");
      }

      const overdue = await Loan.find({
        status: "active",
        endDate: { $lt: now }
      }).populate("userId", "phone");

      for (const loan of overdue) {
        loan.status = "defaulted";
        await loan.save();
        sendWhatsAppMessage(loan.userId.phone, "?? Your loan is overdue. Please pay immediately.");
      }
    } catch (err) {
      console.error("Cron reminder failed:", err.message);
    }
  });
};

module.exports = startReminderCron;
