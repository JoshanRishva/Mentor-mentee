const express = require("express");
const router = express.Router();
const { updateMentorEmbedding, getProjectRecommendations } = require("../controllers/aiController");
const { createProjectHandler } = require("../controllers/projectController");

// Generate embedding for a mentor
router.post("/mentor/:mentor_id/embed", updateMentorEmbedding);

// Create a project (generates AI summary + embedding)
router.post("/projects", createProjectHandler);

// Get mentor recommendations for a project
router.get("/projects/:projectId/recommendations", getProjectRecommendations);

module.exports = router;