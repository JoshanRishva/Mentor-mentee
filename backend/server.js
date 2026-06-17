const express = require("express");
const cors = require("cors");
require("dotenv").config();
<<<<<<< HEAD

=======
const cors = require("cors");
>>>>>>> 1850406663b70c486fcae42ca9d99f53bf06ec77
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
app.use(cors());

/* -------------------- Routes -------------------- */

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
<<<<<<< HEAD

/* -------------------- Home Route -------------------- */

=======
app.use("/api/goals", goalsRoutes);
// Home Route
>>>>>>> 1850406663b70c486fcae42ca9d99f53bf06ec77
app.get("/", (req, res) => {
  res.send("Mentor-Mentee Backend Running");
});

/* -------------------- Start Server -------------------- */

const PORT = 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
  console.log(`Home: http://localhost:${PORT}`);
  console.log(`Auth: http://localhost:${PORT}/api/auth`);
  console.log(`Users: http://localhost:${PORT}/api/users`);
  console.log(`Chat: http://localhost:${PORT}/api/chat`);
  console.log(`AI: http://localhost:${PORT}/api/ai`);
  console.log(`Requests: http://localhost:${PORT}/api/requests`);
  console.log(`Mentorships: http://localhost:${PORT}/api/mentorships`);
  console.log(`Roadmaps: http://localhost:${PORT}/api/roadmaps`);
  console.log(`Profile: http://localhost:${PORT}/api/profile`);
  console.log(`Tasks: http://localhost:${PORT}/api/tasks`);
});