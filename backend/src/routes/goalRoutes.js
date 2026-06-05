
const express = require("express");
const router = express.Router();

const goalController = require("../controllers/goalController");

router.get("/goals", goalController.getGoals);
router.post("/goals", goalController.createGoal);
router.put("/goals/:id", goalController.updateGoal);
router.delete("/goals/:id", goalController.deleteGoal);

module.exports = router;