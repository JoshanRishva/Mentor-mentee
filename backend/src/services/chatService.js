const supabase = require("../config/supabase");

// Create Conversation
const createConversation = async (mentorshipId) => {
  const { data, error } = await supabase
    .from("conversations")
    .insert([
      {
        mentorship_id: mentorshipId,
      },
    ])
    .select()
    .single();

  if (error) throw error;

  return data;
};

// Get Conversation By Mentorship
const getConversationByMentorship = async (mentorshipId) => {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("mentorship_id", mentorshipId)
    .single();

  if (error) throw error;

  return data;
};

// Send Message
const sendMessage = async (
  conversationId,
  senderId,
  content
) => {
    const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        content: content,
        delivered: false,
        is_read: false
      },
    ])
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("conversations")
    .update({
      last_message_at: new Date(),
    })
    .eq("id", conversationId);

  return data;
};

// Get Messages
const getMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from("messages")
    .select(`
      *,
      users(full_name)
    `)
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });

  if (error) throw error;

  return data;
};
//File Sharing

  
const uploadFileMessage = async (
  conversationId,
  senderId,
  file
) => {
  const isImage =
    file.mimetype.startsWith("image/");

  const fileName =
    `${Date.now()}-${file.originalname}`;

  const { error: uploadError } =
    await supabase.storage
      .from("chat-files")
      .upload(
        fileName,
        file.buffer,
        {
          contentType: file.mimetype
        }
      );

  if (uploadError)
    throw uploadError;

  const { data: publicUrlData } =
    supabase.storage
      .from("chat-files")
      .getPublicUrl(fileName);

  const publicUrl =
    publicUrlData.publicUrl;

  const { data, error } =
  await supabase
    .from("messages")
    .insert([
      {
        conversation_id: conversationId,
        sender_id: senderId,
        message_type:
          isImage
            ? "image"
            : "file",
        content:
          file.originalname,
        file_url:
          publicUrl
      }
    ])
    .select()
    .single();

  if (error)
    throw error;

  return data;
};

//ReadReceipts

async function markConversationAsRead(conversationId, currentUserId) {
  
    const { data, error } = await supabase
    .from("messages")
    .update({
      is_read: true,
      read_at: new Date().toISOString()
    })
    .eq("conversation_id", conversationId)
    .neq("sender_id", currentUserId)
    .eq("is_read", false)
    .select();

  if (error) throw error;

  return data;
}

//Typing Indicator

const sendTypingStatus = async (
  conversationId,
  userId,
  typing
) => {

  return {
    conversationId,
    userId,
    typing,
    timestamp: new Date().toISOString()
  };

};

module.exports = {
  createConversation,
  getConversationByMentorship,
  sendMessage,
  getMessages,
  uploadFileMessage,
  markConversationAsRead,
  sendTypingStatus
};