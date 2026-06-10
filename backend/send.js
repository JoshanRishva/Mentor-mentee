const supabase = require("./src/config/supabase");

async function sendMessage() {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: "3753f078-434a-4719-9adb-1efb57e2ca97",
      sender_id: "d0163d7d-f2cf-463e-b604-4f74dd5abe9a",
      content: "Hello from realtime test"
    })
    .select();

  if (error) {
    console.log(error);
    return;
  }

  console.log(data);
}

sendMessage();