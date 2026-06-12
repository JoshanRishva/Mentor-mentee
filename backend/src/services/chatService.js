const supabase = require("../config/supabase");

// Create Conversation
const createConversation = async (mentorshipId) => {

  const test = await supabase
    .from("conversations")
    .select("*");

  console.log("TEST SELECT:", test);

  const { data, error } = await supabase
    .from("conversations")
    .insert([
      {
        mentorship_id: mentorshipId,
      },
    ])
    .select()
    .single();

  console.log("Data:", data);
  console.log("Error:", error);

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
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });

  if (error) throw error;

  return data;
};

module.exports = {
  createConversation,
  getConversationByMentorship,
  sendMessage,
  getMessages,
};