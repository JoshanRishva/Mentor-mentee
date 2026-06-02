const express = require("express");
const router = express.Router();

router.post("/suggest", async (req, res) => {
  res.json({
    message: "AI Mentor Suggestion"
  });
});

module.exports = router;