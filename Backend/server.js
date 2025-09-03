// File upload middleware
const fileUpload = require("./config/expressFileUpload");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const rateLimit = require("express-rate-limit");
const app = express();
app.use(fileUpload);
// TEMP: Wide-open CORS (allow all origins). WARNING: Do NOT use in production.
// Replace this with a restrictive list before deploying publicly.
app.use(
  cors({
    origin: "*", // reflect all origins
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
    exposedHeaders: ["Content-Length"],
    credentials: false, // can't be true when origin is '*'
    optionsSuccessStatus: 204,
  })
);
// Removed explicit app.options('*', cors()) because Express 5 path-to-regexp v6
// can throw on '*' patterns; cors() middleware already handles preflight.

app.use(express.json());

// OTP rate limiter: max 5 requests per 10 minutes per IP
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // limit each IP to 5 OTP requests per windowMs
  message: { message: "Too many OTP requests from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const PORT = process.env.PORT || 5000;
const authRoutes = require("./routes/auth");
const voteRoutes = require("./routes/vote");
const adminModule = require("./routes/admin");
const adminRoutes = adminModule.router || adminModule;
const { adminAuth } = adminModule;
const candidateRoutes = require("./routes/candidate");
const positionRoutes = require("./routes/position");

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.use("/uploads", express.static("uploads"));
// Apply OTP rate limiter only to OTP request endpoint
app.use("/api/auth/request-otp", otpLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/vote", voteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/position", positionRoutes);

const mongoUri = process.env.MONGO_URI;
// Increase pool size for more concurrent connections (default 10, now 50)
const mongoPoolSize = process.env.MONGO_POOL_SIZE ? Number(process.env.MONGO_POOL_SIZE) : 50;

if (!mongoUri) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}

// Helper to mask credentials when logging
function redactMongoUri(uri) {
  return uri.replace(/:\/\/([^:]+):([^@]+)@/, (m, u) => `://${u}:***@`);
}

// Use async/await for connection
(async () => {
  try {
    await mongoose.connect(mongoUri, {
      maxPoolSize: mongoPoolSize,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    console.log(`[mongoose] Connected with pool size: ${mongoPoolSize}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
})();

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongoose connection closed on app termination");
  process.exit(0);
});
