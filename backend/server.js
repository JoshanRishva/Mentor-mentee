const express = require("express");
const cors = require("cors");
<<<<<<< HEAD
require("dotenv").config();

=======
require("dotenv").config()

const cookieParser = require("cookie-parser");
>>>>>>> 5e716697affe301ca39fe42e8aa9168a9ed83b88
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const mentorshipRoutes = require("./src/routes/mentorshipRoutes");
const roadmapRoutes = require("./src/routes/roadmapRoutes");
const emailAssistantRoutes = require("./src/routes/emailassitantRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const goalsRoutes = require("./src/routes/goalRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const app = express();

// Middleware

/* -------------------- Middleware -------------------- */

// Enable CORS for your React Vite frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - FIXED: Using environment variable
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());

/* -------------------- Routes -------------------- */

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/email-assistant", emailAssistantRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/tasks", taskRoutes);


app.use("/api/goals", goalsRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Mentor-Mentee Backend Running");
});

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`);
  console.log(`\n📍 API Routes:`);
  console.log(`   Home: http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Auth: http://localhost:${PORT}/api/auth`);
  console.log(`   Users: http://localhost:${PORT}/api/users`);
  console.log(`   Chat: http://localhost:${PORT}/api/chat`);
  console.log(`   AI: http://localhost:${PORT}/api/ai`);
  console.log(`   Goals: http://localhost:${PORT}/api/goals`);
  console.log(`   Requests: http://localhost:${PORT}/api/requests`);
  console.log(`   Mentorships: http://localhost:${PORT}/api/mentorships`);
  console.log(`   Roadmaps: http://localhost:${PORT}/api/roadmaps`);
  console.log(`   Tasks: http://localhost:${PORT}/api/tasks`);
  console.log(`   Email Assistant: http://localhost:${PORT}/api/email-assistant`);
  console.log(`   Profile: http://localhost:${PORT}/api/profile\n`);
});
