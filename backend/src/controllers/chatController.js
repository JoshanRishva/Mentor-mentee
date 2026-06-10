const supabase = require("../config/supabase");
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

    console.error(
      "SEND MESSAGE ERROR:",
      error
    );

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

//File Sharing

const uploadFile = async (
  req,
  res
) => {

  try {

    const {
      conversationId,
      senderId
    } = req.body;

    const file = req.file;

    const message =
      await chatService
        .uploadFileMessage(
          conversationId,
          senderId,
          file
        );

    res.status(201)
      .json(message);

  } catch (error) {

  console.error("UPLOAD ERROR:", error);

  res.status(500).json({
    error: error.message,
    details: error
  });

}

};

//Read Receipts

const markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { currentUserId } = req.body;

    const result = await chatService.markConversationAsRead(
      conversationId,
      currentUserId
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

//Typing Indicator
const sendTypingStatus = async (
  req,
  res
) => {

  try {

    const {
      conversationId,
      userId,
      typing
    } = req.body;

    const result =
      await chatService
        .sendTypingStatus(
          conversationId,
          userId,
          typing
        );

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

};

module.exports = {
  createConversation,
  sendMessage,
  getMessages,
  uploadFile,
  markConversationAsRead,
  sendTypingStatus
};
  