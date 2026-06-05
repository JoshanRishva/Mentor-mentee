
const express = require("express");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const goalRoutes = require("./src/routes/goalRoutes");
const requestRoutes = require("./src/routes/requestRoutes");
const mentorshipRoutes = require("./src/routes/mentorshipRoutes");

const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/mentorships", mentorshipRoutes);

// Home Route
app.get("/", (req, res) => {
  res.send("Mentor-Mentee Backend Running");
});

// Start Server
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
  console.log("Home: http://localhost:5000");
  console.log("Auth: http://localhost:5000/api/auth");
  console.log("Users: http://localhost:5000/api/users");
  console.log("Chat: http://localhost:5000/api/chat");
  console.log("AI: http://localhost:5000/api/ai");
  console.log("Goals: http://localhost:5000/api/goals");
  console.log("Requests: http://localhost:5000/api/requests");
  console.log("Mentorships: http://localhost:5000/api/mentorships");
});