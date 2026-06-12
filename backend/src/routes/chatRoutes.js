const express = require("express");

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

module.exports = router;