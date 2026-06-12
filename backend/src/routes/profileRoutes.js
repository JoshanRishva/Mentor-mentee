const express = require("express");
const router = express.Router();
const multer = require("multer");

const profileController = require("../controllers/profileController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPEG, PNG, WEBP and GIF allowed"), false);
  },
});



// static routes first — before /:userId
router.get("/me",        profileController.getMyProfile);
router.get("/stats",     profileController.getStats);
router.get("/mentors",   profileController.getMentors);
router.get("/goals",     profileController.getGoals);
router.get("/dashboard", profileController.getDashboard);

router.put("/",                          profileController.updateProfile);
router.patch("/avatar", upload.single("avatar"), profileController.uploadAvatar);
router.delete("/avatar",                 profileController.deleteAvatar);

// dynamic route last
router.get("/:userId", profileController.getUserProfile);

module.exports = router;