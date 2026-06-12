const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByGoal,
  getTaskById,
  updateTask,
  deleteTask,
  submitTask,
  reviewSubmission,
  getSubmissionsByTask,
} = require('../controllers/taskController');

const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// ─── Task CRUD ────────────────────────────────────────────
// POST   /api/tasks                              → create a task
// GET    /api/tasks/goal/:goalId                 → all tasks for a goal
// GET    /api/tasks/:taskId                      → single task (with submissions)
// PUT    /api/tasks/:taskId                      → update task
// DELETE /api/tasks/:taskId                      → delete task + its submissions

router.post('/', createTask);
router.get('/goal/:goalId', getTasksByGoal);
router.get('/:taskId', getTaskById);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

// ─── Task Submissions ─────────────────────────────────────
// POST   /api/tasks/:taskId/submit               → mentee submits work
// GET    /api/tasks/:taskId/submissions          → get all submissions for a task
// PUT    /api/tasks/submissions/:submissionId/review → mentor reviews submission

router.post('/:taskId/submit', submitTask);
router.get('/:taskId/submissions', getSubmissionsByTask);
router.put('/submissions/:submissionId/review', reviewSubmission);

module.exports = router;