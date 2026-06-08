const express    = require("express");
const router     = express.Router();
const controller = require("../controllers/roadmapController");

// create roadmap
router.post("/",                          controller.generateRoadmap);

// list roadmaps for a user
router.get("/",                           controller.listRoadmaps);
router.get(
  "/project/:projectId",
  controller.listProjectRoadmaps
);

// get single roadmap with full hierarchy
router.get("/:id",                        controller.getRoadmap);

// update title / notes
router.put("/:id",                        controller.updateRoadmap);

// archive roadmap
router.delete("/:id",                     controller.archiveRoadmap);

// regenerate — archives current, generates new
router.post("/:id/regenerate",            controller.regenerateRoadmap);

// restore archived roadmap to active
router.post("/:id/restore",              controller.restoreRoadmap);

// toggle task complete
router.patch("/tasks/:taskId/complete",   controller.completeTask);

module.exports = router;