const express = require("express");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const chatRoutes = require("./src/routes/chatRoutes");
const aiRoutes = require("./src/routes/aiRoutes");
const goalRoutes = require("./src/routes/goalRoutes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/goals", goalRoutes);

app.get("/", (req, res) => {
  res.send("Mentor-Mentee Backend Running");
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
  console.log("Home: http://localhost:5000");
  console.log("Auth: http://localhost:5000/api/auth");
  console.log("Users: http://localhost:5000/api/users");
  console.log("Chat: http://localhost:5000/api/chat");
  console.log("AI: http://localhost:5000/api/ai");
  console.log("Goals: http://localhost:5000/api/goals");
});