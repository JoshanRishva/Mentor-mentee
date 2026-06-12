const chatService = require("../services/chatService");

// Create Conversation
const createConversation = async (req, res) => {
  try {

    console.log("BODY:", req.body);

    const { mentorshipId } = req.body;

    const conversation =
      await chatService.createConversation(
        mentorshipId
      );

    res.status(201).json(conversation);

  } catch (error) {

    console.error("CREATE CONVERSATION ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
};

// Send Message
const sendMessage = async (req, res) => {
  try {
    const {
      conversationId,
      senderId,
      content,
    } = req.body;

    const message =
      await chatService.sendMessage(
        conversationId,
        senderId,
        content
      );

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// Get Messages
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages =
      await chatService.getMessages(
        conversationId
      );

    res.status(200).json(messages);
  } catch (error) {
  console.error("CHAT ERROR:", error);

  res.status(500).json({
    success: false,
    message: error.message,
    details: error
  });
}
};

module.exports = {
  createConversation,
  sendMessage,
  getMessages,
};