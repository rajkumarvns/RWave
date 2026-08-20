import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useTheme, chatWallpapers } from "../context/ThemeContext";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ChatWindow = () => {
  const {
    selectedUser,
    setSelectedUser,
    messages,
    setMessages,
    sendMessage,
    isMessagesLoading,
    onlineUsers,
  } = useChat();
  const { authUser } = useAuth();
  const { chatWallpaper } = useTheme();
  const currentWallpaper = chatWallpapers[chatWallpaper] || chatWallpapers.default;

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menus when clicking outside could be added, but for simplicity we toggle

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-200 transition-colors duration-300 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#4f46e5 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center z-10 p-12 max-w-md"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary text-primary-content rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl text-5xl transform hover:scale-110 transition-transform">
            👋
          </div>
          <h2 className="text-3xl font-extrabold text-base-content mb-3">
            Welcome to RWave
          </h2>
          <p className="text-base-content/70 text-lg">
            Hover over the sidebar to select a conversation.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const playSendSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        300,
        audioCtx.currentTime + 0.15,
      );

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.15,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.15);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({ text: text.trim(), image: imagePreview, isGhost: isGhostMode });
      playSendSound();
      setText("");
      removeImage();
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to clear this entire chat history?",
      )
    )
      return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/messages/clear/${selectedUser._id}`,
        {
          withCredentials: true,
        },
      );
      toast.success("History cleared");
      setMessages([]);
      setShowMenu(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || error.message || "Failed to clear history");
    }
  };

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const filteredMessages = messages.filter(
    (m) => m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayMessages = searchQuery ? filteredMessages : messages;
  const handleBlockUser = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/auth/block/${selectedUser._id}`,
        {},
        { withCredentials: true }
      );
      setAuthUser({ ...authUser, blockedUsers: response.data.blockedUsers });
      toast.success("User blocked");
      setShowMenu(false);
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  const handleUnblockUser = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/auth/unblock/${selectedUser._id}`,
        {},
        { withCredentials: true }
      );
      setAuthUser({ ...authUser, blockedUsers: response.data.blockedUsers });
      toast.success("User unblocked");
      setShowMenu(false);
    } catch (error) {
      toast.error("Failed to unblock user");
    }
  };

  const isBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);
  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <div className="flex-1 flex flex-col h-full bg-base-200 transition-colors duration-300 relative">
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300 bg-repeat"
        style={{
          backgroundImage: currentWallpaper.url ? `url('${currentWallpaper.url}')` : 'none',
          backgroundColor: currentWallpaper.overlayColor || 'transparent',
          opacity: currentWallpaper.opacity || 0.05,
        }}
      ></div>

      {/* Header */}
      <div className="h-[76px] px-6 border-b border-base-300 flex items-center justify-between bg-base-100/80 backdrop-blur-md z-30 shadow-sm relative">
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center w-full gap-4"
            >
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="p-2 text-base-content/70 hover:text-primary rounded-full hover:bg-base-200"
              >
                ←
              </button>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in this chat..."
                className="input input-bordered flex-1 px-4 py-2 bg-base-200 rounded-lg focus:outline-none text-base-content"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-4 cursor-pointer group">
                <div className="avatar indicator">
                  {isOnline && <span className="indicator-item badge badge-success badge-xs"></span>}
                  <div className="w-12 h-12 rounded-full shadow-sm group-hover:shadow-md transition-shadow">
                    <img src={selectedUser.profilePic || "/logo.png"} alt="avatar" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-base-content leading-tight group-hover:text-primary transition-colors">
                    {selectedUser.fullName}
                    {isBlocked && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Blocked</span>}
                  </h3>
                  <p className={`text-sm font-medium ${isOnline ? "text-green-600" : "text-base-content/70"}`}>
                    {isOnline ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 relative">
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-base-content/50 hover:text-primary hover:bg-base-200 transition-all"
                >
                  🔍
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-base-content/50 hover:text-primary hover:bg-base-200 transition-all"
                >
                  ⋮
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {showMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="dropdown-content menu absolute top-12 right-0 w-48 bg-base-100 rounded-xl shadow-xl border border-base-300 py-2 z-[60]"
                    >
                      <button onClick={() => { setSelectedUser(null); setShowMenu(false); }} className="w-full text-left px-4 py-2 text-base-content/80 hover:bg-base-200 flex items-center gap-2">
                        ✕ Close Chat
                      </button>
                      <button onClick={handleClearHistory} className="w-full text-left px-4 py-2 text-base-content/80 hover:bg-base-200 flex items-center gap-2 mt-1">
                        🗑️ Clear History
                      </button>
                      
                      <div className="border-t border-base-300 my-1"></div>
                      
                      {isBlocked ? (
                        <button onClick={handleUnblockUser} className="w-full text-left px-4 py-2 text-primary hover:bg-base-200 flex items-center gap-2">
                          🔓 Unblock User
                        </button>
                      ) : (
                        <button onClick={handleBlockUser} className="w-full text-left px-4 py-2 text-error hover:bg-base-200 flex items-center gap-2">
                          🚫 Block User
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message Area */}
      <div
        className="flex-1 card overflow-y-auto px-6 py-8 custom-scrollbar z-10 relative bg-transparent shadow-none border-none rounded-none"
        onClick={() => setShowEmojiPicker(false)}
      >
        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="text-center text-base-content/50 mt-10">
            No messages found.
          </div>
        ) : (
          displayMessages.map((message) => (
            <MessageBubble
              key={message._id}
              message={message}
              isSent={message.senderId === authUser._id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-transparent z-10 transition-colors duration-300 relative">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-base-300"
              >
                <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {imagePreview && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-4 relative inline-block bg-base-100 p-2 rounded-2xl shadow-xl border border-base-300"
              >
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 rounded-xl object-cover"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-3 -right-3 bg-base-content text-base-100 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-error hover:scale-110 shadow-lg transition-all"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {isBlocked ? (
            <div className="p-4 text-center text-base-content/70 bg-base-200 rounded-xl">
              You have blocked this user.
            </div>
          ) : (
            <form
              onSubmit={handleSendMessage}
              className="flex gap-3 items-end relative z-20"
            >
              <div className="flex-1 input bg-base-100 rounded-3xl shadow-lg border border-base-300 flex items-end p-1.5 transition-colors min-h-[56px] h-auto">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 mb-0.5 text-base-content/50 hover:text-primary hover:bg-base-200 rounded-full transition-colors flex-shrink-0"
                  title="Attach Image"
                >
                  <svg
                    className="w-6 h-6 transform rotate-45"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    ></path>
                  </svg>
                </button>

                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Message..."
                  className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none py-3 px-2 focus:outline-none text-base-content placeholder-base-content/50 custom-scrollbar"
                  rows="1"
                />

                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-3 mb-0.5 rounded-full transition-colors flex-shrink-0 ${showEmojiPicker ? "text-primary bg-primary/10" : "text-base-content/50 hover:text-primary hover:bg-base-200"}`}
                  title="Emojis"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setIsGhostMode(!isGhostMode)}
                  className={`p-3 mb-0.5 rounded-full transition-colors flex-shrink-0 ${isGhostMode ? "text-purple-500 bg-purple-50" : "text-base-content/50 hover:text-purple-500 hover:bg-base-200"}`}
                  title="Ghost Mode (Auto-delete)"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4c-3.3 0-6 2.7-6 6v7l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5V10c0-3.3-2.7-6-6-6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9h.01M14 9h.01" />
                  </svg>
                </button>
              </div>

              <button
                type="submit"
                disabled={(!text.trim() && !imagePreview) || isBlocked}
                className={`p-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${(!text.trim() && !imagePreview) || isBlocked ? "bg-base-300 text-base-content/50 cursor-not-allowed" : "bg-primary hover:bg-secondary hover:scale-105 text-primary-content shadow-primary/30"}`}
              >
                <svg
                  className="w-6 h-6 transform translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  ></path>
                </svg>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
