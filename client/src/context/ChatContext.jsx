import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { io } from "socket.io-client";
import axios from "axios";

export const ChatContext = createContext();

export const useChat = () => {
  return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
  const { authUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(() => {
    const saved = localStorage.getItem("selectedUser");
    return saved ? JSON.parse(saved) : null;
  });
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (selectedUser) {
      localStorage.setItem("selectedUser", JSON.stringify(selectedUser));
    } else {
      localStorage.removeItem("selectedUser");
    }
  }, [selectedUser]);

  // Handle Socket Connection when user logs in/out
  useEffect(() => {
    if (authUser) {
      const newSocket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:4500", {
        query: {
          userId: authUser._id,
        },
      });
      setSocket(newSocket);

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authUser]);

  // Handle incoming real-time messages and typing status
  useEffect(() => {
    socket?.on("receive-message", (newMessage) => {
      if (
        selectedUser &&
        (String(newMessage.senderId) === String(selectedUser._id) ||
         String(newMessage.receiverId) === String(selectedUser._id))
      ) {
        if (String(newMessage.senderId) === String(selectedUser._id)) {
          newMessage.status = "seen";
          socket.emit("mark-messages-seen", { senderId: selectedUser._id });
        }
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    socket?.on("message-deleted", (deletedMessageId) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== deletedMessageId),
      );
    });

    socket?.on("typing-status", ({ senderId }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(senderId)) return [...prev, senderId];
        return prev;
      });
    });

    socket?.on("stop-typing-status", ({ senderId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== senderId));
    });

    socket?.on("message-status-update", ({ messageId, status }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, status } : msg
        )
      );
    });

    socket?.on("messages-seen", ({ chatWith }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          String(msg.receiverId) === String(chatWith)
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });

    socket?.on("message-edited", ({ messageId, text }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, text } : msg
        )
      );
    });

    return () => {
      socket?.off("receive-message");
      socket?.off("message-deleted");
      socket?.off("typing-status");
      socket?.off("stop-typing-status");
      socket?.off("message-status-update");
      socket?.off("messages-seen");
      socket?.off("message-edited");
    };
  }, [socket, selectedUser]);

  // Fetch initial chat history
  const getMessages = async (userId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/messages/${userId}`,
        {
          withCredentials: true,
        },
      );
      setMessages(res.data);
      if (socket) {
        socket.emit("mark-messages-seen", { senderId: userId });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send a new message
  const sendMessage = async (messageData) => {
    if (!selectedUser) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/messages/send/${selectedUser._id}`,
        messageData,
        {
          withCredentials: true,
        },
      );
      setMessages((prevMessages) => [...prevMessages, res.data]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Trigger history fetch when selected user changes
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  return (
    <ChatContext.Provider
      value={{
        socket,
        onlineUsers,
        typingUsers,
        selectedUser,
        setSelectedUser,
        messages,
        sendMessage,
        setMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

