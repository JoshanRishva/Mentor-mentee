const express = require("express");
const router = express.Router();

const {
  getAllMentorships,
  getMentorshipById,
  getMentorMentorships,
  getMenteeMentorships,
  completeMentorship,
  cancelMentorship,
  createMentorshipFromRequest  // ✅ add this
} = require("../controllers/mentorshipController");

router.get("/", getAllMentorships);

router.post("/from-request", createMentorshipFromRequest);  // ✅ add this

router.get("/:mentorshipId", getMentorshipById);

router.get("/mentor/:mentorId", getMentorMentorships);

router.get("/mentee/:menteeId", getMenteeMentorships);

router.patch("/:mentorshipId/complete", completeMentorship);

router.patch("/:mentorshipId/cancel", cancelMentorship);

module.exports = router;