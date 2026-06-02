const express = require("express");
const router = express.Router();

router.post("/register", async (req, res) => {
  res.json({ message: "Register User" });
});

router.post("/login", async (req, res) => {
  res.json({ message: "Login User" });
});

module.exports = router;