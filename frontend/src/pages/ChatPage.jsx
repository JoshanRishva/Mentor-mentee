import { useEffect, useState,useRef } from "react";
import API from "../api/chatApi";
import supabase from "../config/supabase";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingChannelRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  
  useEffect(() => {

    fetchMessages();
  }, []);
  useEffect(() => {
      const markRead = async () => {
        try {
          await API.patch(
            `/conversations/${localStorage.getItem(
              "conversationId"
            )}/read`,
            {
              currentUserId: localStorage.getItem("userId"),
            }
          );
        } catch (err) {
          console.error(err);
        }
      };

      if (messages.length > 0) {
        markRead();
      }
    }, [messages]);
  useEffect(() => {
  const conversationId = localStorage.getItem("conversationId");

  const channel = supabase
    .channel("messages-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      (payload) => {
        if (
          payload.new.conversation_id === conversationId
        ) {
          setMessages((prev) => {
            // Prevent duplicates
            const exists = prev.some(
              (m) => m.id === payload.new.id
            );

            if (exists) return prev;

            return [...prev, payload.new];
          });
        }
      }
    )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  useEffect(() => {
    typingChannelRef.current = supabase.channel("typing-channel");

    typingChannelRef.current.subscribe();

    return () => {
      supabase.removeChannel(typingChannelRef.current);
    };
  }, []);
  const fetchMessages = async () => {
    try {
      const conversationId = localStorage.getItem("conversationId");

      const res = await API.get(`/messages/${conversationId}`);

      setMessages(res.data);
    } catch (error) {
      console.error("Fetch Messages Error:", error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      const conversationId = localStorage.getItem("conversationId");
      const senderId = localStorage.getItem("userId");

      await API.post("/message", {
        conversationId,
        senderId,
        content: message,
      });

      setMessage("");
      
      
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };
    const sendTypingStatus = (typing) => {
    typingChannelRef.current?.send({
      type: "broadcast",
      event: "typing",
      payload: {
        conversationId: localStorage.getItem("conversationId"),
        userId: localStorage.getItem("userId"),
        typing,
      },
    });
  };
    useEffect(() => {
      const conversationId = localStorage.getItem("conversationId");
      const currentUserId = localStorage.getItem("userId");

      const typingChannel = supabase
        .channel("typing-channel")
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (
            payload.conversationId === conversationId &&
            payload.userId !== currentUserId
          ) {
            setIsTyping(payload.typing);
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(typingChannel);
      };
    }, []);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-5 text-3xl font-bold border-b">
          Chats
        </div>

        <div className="p-4 hover:bg-gray-100 cursor-pointer border-b">
          Mentor
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-white p-5 border-b shadow-sm">
          <h2 className="text-2xl font-semibold">
            Mentor
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              No messages yet
            </p>
          ) : (
            messages.map((msg) => {
              const isMine =
                String(msg.sender_id) ===
                String(localStorage.getItem("userId"));
          
              return (
                <div
                  key={msg.id}
                  className={`flex mb-4 ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-xl max-w-sm break-words ${
                      isMine
                        ? "bg-blue-500 text-white"
                        : "bg-white shadow"
                    }`}
                  >
                    {msg.file_url ? (
                      msg.message_type === "image" ? (
                        <a
                          href={msg.file_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            src={msg.file_url}
                            alt={msg.content}
                            className="
                              max-w-sm
                              max-h-64
                              rounded-xl
                              cursor-pointer
                              object-cover
                              hover:opacity-90
                            "
                          />
                        </a>
                      ) : (
                        <a
                          href={msg.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="block bg-white rounded-xl p-3 shadow border hover:bg-gray-100"
                        >
                          <div className="text-3xl">📄</div>

                          <div className="font-medium break-all">
                            {msg.content}
                          </div>

                          <div className="text-sm text-blue-600">
                            Click to download
                          </div>
                        </a>
                      )
                    ) : (
                      <div>{msg.content}</div>
                    )}

                    <div className="flex justify-end items-center gap-1 mt-1 text-[10px] text-gray-350"> 
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>

                    {isMine && (
                        <span>
                          {msg.is_read
                            ? "✓✓"
                            : msg.delivered
                            ? "✓✓"
                            : "✓"}
                        </span>
                      )}
                    </div>
                    <div ref={messagesEndRef}></div>
                  </div>
                </div>
              );
            })
            
          )}
        </div>
        {isTyping && (
        <div className="px-5 py-2 text-sm text-gray-500 italic">
          typing...
        </div>
      )}
      
        {/* Bottom Input */}
        <div className="bg-white border-t p-4 flex gap-3">

          <input
              type="file"
              id="fileInput"
              hidden
              onChange={async (e) => {
                const file = e.target.files[0];

                if (!file) return;

                

                const formData = new FormData();
                formData.append("file", file);
                formData.append(
                  "conversationId",
                  localStorage.getItem("conversationId")
                );
                formData.append(
                  "senderId",
                  localStorage.getItem("userId")
                );

                try {
                  await API.post("/file", formData, {
                    headers: {
                      "Content-Type": "multipart/form-data",
                    },
                  });

                  
                  document.getElementById("fileInput").value = "";
                } catch (err) {
                  console.error("Upload failed:", err);
                }
              }}
            />

          <button
              onClick={() =>
                document.getElementById("fileInput").click()
              }
              className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-xl"
            >
              📎
          </button>

          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);

              sendTypingStatus(true);

              clearTimeout(window.typingTimeout);

              window.typingTimeout = setTimeout(() => {
                sendTypingStatus(false);
              }, 1000);
            }}
            placeholder="Type a message..."
            className="flex-1 h-12 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
              onClick={handleSend}
              className="h-12 px-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-medium"
            >
              Send
          </button>

        </div>
      </div>
    </div>
  );
}