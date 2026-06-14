const express = require("express");
require("dotenv").config();
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const mentorshipRoutes = require("./src/routes/mentorshipRoutes");
const roadmapRoutes = require("./src/routes/roadmapRoutes");
const emailAssistantRoutes = require("./src/routes/emailassitantRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const taskRoutes = require("./src/routes/taskRoutes");

const goalsRoutes = require("./src/routes/goalRoutes");

const pool = require("./src/config/db");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/roadmaps", roadmapRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/email-assistant", emailAssistantRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/goals", goalsRoutes);
// Home Route
app.get("/", (req, res) => {
  res.send("Mentor-Mentee Backend Running");
});

app.listen(5000, () => {
  console.log(process.env.GEMINI_API_KEY);
  console.log("🚀 Server running on port 5000");
  console.log("Home: http://localhost:5000");
  console.log("Auth: http://localhost:5000/api/auth");
  console.log("Users: http://localhost:5000/api/users");
  console.log("Chat: http://localhost:5000/api/chat");
  console.log("AI: http://localhost:5000/api/ai");
  console.log("Goals: http://localhost:5000/api/goals");
  console.log("Requests: http://localhost:5000/api/requests");
  console.log("Mentorships: http://localhost:5000/api/mentorships");
  console.log("Tasks: http://localhost:5000/api/tasks");
});