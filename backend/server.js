const express = require("express");
require("dotenv").config();
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const mentorshipRoutes = require("./src/routes/mentorshipRoutes");
const roadmapRoutes = require("./src/routes/roadmapRoutes");
const emailAssistantRoutes = require("./src/routes/EmailassitantRoutes");
const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai/roadmaps", roadmapRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/email-assistant", emailAssistantRoutes);
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
});