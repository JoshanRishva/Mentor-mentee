const supabase =
require("./src/config/supabase");

supabase
  .channel("chat-room")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "messages"
    },
    (payload) => {

      console.log(
        "NEW MESSAGE"
      );

      console.log(
        payload.new
      );

    }
  )
  .subscribe(
    (status) => {
      console.log(status);
    }
  );