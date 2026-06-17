const express = require("express");

const upload =  require("../middleware/upload");

const router = express.Router();

const chatController = require(
  "../controllers/chatController"
);



router.post(
  "/conversation",
  chatController.createConversation
);

router.post(
  "/message",
  chatController.sendMessage
);

router.get(
  "/messages/:conversationId",
  chatController.getMessages
);

router.post(
  "/file",
  upload.single("file"),
  chatController.uploadFile
);

router.patch(
  "/conversations/:conversationId/read",
  chatController.markConversationAsRead
);

router.post(
  "/typing",
  chatController.sendTypingStatus
);

module.exports = router;
