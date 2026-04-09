require("dotenv").config();
const User = require("./models/User");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");



const path = require("path");

const app = express();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://proconnectapp.vercel.app",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/streak", require("./routes/streak"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/articles", require("./routes/articles"));

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/proconnect";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅MongoDB connected"))
  .catch((err) => console.error("❎MongoDB connnection error:", err));

app.get("/", (req, res) => {
  res.send("✅Backend is running");
});

const server = app.listen(PORT, () => {
  console.log(`✅Server running on http://localhost:${PORT}`);
});

// Increase timeout for large file uploads (10 minutes)
server.timeout = 600000;

// Simple test route
// app.get('/api/test', (req, res) => {
//   res.json({ message: "Backend is live!" });
// });

// MongoDB test route
app.get("/api/db-test", async (req, res) => {
  try {
    // Replace 'User' with one of your actual Mongoose models
    const users = await User.find();
    res.json({ message: "MongoDB connected!", users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
