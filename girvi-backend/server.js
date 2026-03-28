require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { initCloudinary } = require("./config/cloudinary");
const startReminderCron = require("./cron/reminder");
const errorHandler = require("./middleware/error");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const loanRoutes = require("./routes/loanRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

initCloudinary();

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://girvi-app-9a2y.vercel.app",
];

const allAllowedOrigins = [...new Set([...allowedOrigins, ...defaultOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, "");
      if (allAllowedOrigins.includes(cleanOrigin)) return callback(null, true);
      
      console.warn(`Blocked CORS request from origin: ${origin}`);
      return callback(new Error("CORS not allowed"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({ message: "Girvi backend running" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    startReminderCron();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ BACKEND CRASH AT STARTUP:");
    console.error("Reason:", err.message);
    if (err.message.includes("MONGO_URI")) {
      console.error("TIP: Ensure MONGO_URI is set in your Render environment variables.");
    } else if (err.message.includes("whitelist")) {
      console.error("TIP: Go to MongoDB Atlas -> Network Access and add '0.0.0.0/0' to allow Render to connect.");
    }
    process.exit(1);
  });
