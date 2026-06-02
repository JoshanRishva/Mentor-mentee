const express = require("express");
const router = express.Router();

router.post("/send", async (req, res) => {
  res.json({ message: "Message Sent" });
});

router.get("/:mentorId/:menteeId", async (req, res) => {
  res.json({ message: "Chat History" });
});

module.exports = router;