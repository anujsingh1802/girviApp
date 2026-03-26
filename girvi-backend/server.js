require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { initCloudinary } = require("./config/cloudinary");
const { initTwilio } = require("./utils/whatsapp");
const startReminderCron = require("./cron/reminder");
const errorHandler = require("./middleware/error");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const loanRoutes = require("./routes/loanRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

initCloudinary();
initTwilio();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "Girvi backend running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/payment", paymentRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    startReminderCron();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });
