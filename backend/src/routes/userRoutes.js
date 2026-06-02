const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  res.json({ message: "Get All Users" });
});

router.get("/:id", async (req, res) => {
  res.json({ message: `Get User ${req.params.id}` });
});

router.put("/:id", async (req, res) => {
  res.json({ message: `Update User ${req.params.id}` });
});

router.delete("/:id", async (req, res) => {
  res.json({ message: `Delete User ${req.params.id}` });
});

module.exports = router;