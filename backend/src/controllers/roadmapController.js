const service = require("../services/roadmapService.js");

const generateRoadmap = async (req, res) => {
  try {
    const roadmap = await service.generate(req.body);
    res.status(201).json({ success: true, roadmap });
  } catch (err) {
    console.error("generateRoadmap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const listRoadmaps = async (req, res) => {
  try {
    const { user_id, project_id, status } = req.query;
    const roadmaps = await service.list({ user_id, project_id, status });
    res.json({ success: true, total: roadmaps.length, roadmaps });
  } catch (err) {
    console.error("listRoadmaps error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getRoadmap = async (req, res) => {
  try {
    const roadmap = await service.getById(req.params.id);
    if (!roadmap) return res.status(404).json({ success: false, error: "Roadmap not found" });
    res.json({ success: true, roadmap });
  } catch (err) {
    console.error("getRoadmap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateRoadmap = async (req, res) => {
  try {
    const roadmap = await service.update(req.params.id, req.body);
    if (!roadmap) return res.status(404).json({ success: false, error: "Roadmap not found" });
    res.json({ success: true, roadmap });
  } catch (err) {
    console.error("updateRoadmap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const archiveRoadmap = async (req, res) => {
  try {
    await service.archive(req.params.id);
    res.json({ success: true, message: "Roadmap archived" });
  } catch (err) {
    console.error("archiveRoadmap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const regenerateRoadmap = async (req, res) => {
  try {
    const roadmap = await service.regenerate(req.params.id, req.body);
    res.status(201).json({ success: true, roadmap });
  } catch (err) {
    console.error("regenerateRoadmap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const restoreRoadmap = async (req, res) => {
  try {
    const roadmap = await service.restore(req.params.id);
    res.json({ success: true, roadmap });
  } catch (err) {
    console.error("restoreRoadmap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const result = await service.toggleTask(req.params.taskId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error("completeTask error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
const listProjectRoadmaps = async (req, res) => {
  try {

    const roadmaps = await service.listProjectRoadmaps(
      req.params.projectId
    );

    res.json({
      success: true,
      total: roadmaps.length,
      roadmaps
    });

  } catch (err) {

    console.error("listProjectRoadmaps error:", err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
module.exports = {
  generateRoadmap, listRoadmaps, getRoadmap,
  updateRoadmap,   archiveRoadmap, regenerateRoadmap,
  restoreRoadmap,  completeTask, listProjectRoadmaps,
};