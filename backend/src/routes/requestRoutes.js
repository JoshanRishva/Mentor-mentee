const express = require("express");
const router = express.Router();

const {
  sendRequest,
  getMentorRequests,
  getMenteeRequests,
  getProjectRequests,
  updateRequestStatus,
  cancelRequest,
} = require("../controllers/requestController");

// Send mentorship request
router.post("/", sendRequest);

// Get requests received by mentor
router.get("/mentor/:mentorId", getMentorRequests);

// Get requests sent by mentee
router.get("/mentee/:menteeId", getMenteeRequests);

// Get all requests for a project
router.get("/project/:projectId", getProjectRequests);

// Mentor accept/reject
router.patch("/:requestId", updateRequestStatus);

// Mentee cancel request
router.delete("/:requestId", cancelRequest);

module.exports = router;