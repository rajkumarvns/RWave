import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";

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

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close menus when clicking outside could be added, but for simplicity we toggle

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(#4f46e5 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        ></div>
        <div className="text-center animate-fade-in-up z-10 p-12 max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl text-5xl transform hover:scale-110 transition-transform">
            👋
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            Welcome to RWave
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Hover over the sidebar to select a conversation.
          </p>
        </div>
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
      await sendMessage({ text: text.trim(), image: imagePreview });
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
        `http://localhost:4500/api/messages/clear/${selectedUser._id}`,
        {
          withCredentials: true,
        },
      );
      toast.success("History cleared");
      setMessages([]);
      setShowMenu(false);
    } catch (error) {
      toast.error("Failed to clear history");
    }
  };

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
  };

  const filteredMessages = messages.filter(
    (m) => m.text && m.text.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayMessages = searchQuery ? filteredMessages : messages;
  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f4f7f6] dark:bg-[#0b141a] transition-colors duration-300 relative">
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/cubes.png')",
        }}
      ></div>

      {/* Header */}
      <div className="h-[76px] px-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-30 shadow-sm relative">
        {showSearch ? (
          <div className="flex items-center w-full gap-4 animate-fade-in-up">
            <button
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
              className="p-2 text-slate-500 hover:text-blue-500 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ←
            </button>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this chat..."
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:outline-none text-slate-900 dark:text-white"
            />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 cursor-pointer group">
              <div className="relative">
                <img
                  src={selectedUser.profilePic || "/logo.png"}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover shadow-sm group-hover:shadow-md transition-shadow"
                />
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight group-hover:text-blue-600 transition-colors">
                  {selectedUser.fullName}
                </h3>
                <p
                  className={`text-sm font-medium ${isOnline ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}
                >
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 relative">
              <button
                onClick={() => setShowSearch(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                🔍
              </button>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                ⋮
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-[60] animate-fade-in-up">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    ✕ Close Chat
                  </button>
                  <button
                    onClick={handleClearHistory}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 mt-1 cursor-pointer"
                  >
                    🗑️ Clear History
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Message Area */}
      <div
        className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar z-10 relative"
        onClick={() => setShowEmojiPicker(false)}
      >
        {isMessagesLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : displayMessages.length === 0 ? (
          <div className="text-center text-slate-400 mt-10">
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
          {showEmojiPicker && (
            <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-700">
              <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" />
            </div>
          )}

          {imagePreview && (
            <div className="mb-4 relative inline-block animate-fade-in-up bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 rounded-xl object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-500 hover:scale-110 shadow-lg transition-all"
              >
                ✕
              </button>
            </div>
          )}

          <form
            onSubmit={handleSendMessage}
            className="flex gap-3 items-end relative z-20"
          >
            <div className="flex-1 bg-white dark:bg-[#1e293b] rounded-3xl shadow-lg border border-slate-200 dark:border-slate-700/50 flex items-end p-1.5 transition-colors">
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
                className="p-3 mb-0.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors flex-shrink-0"
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
                className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none py-3 px-2 focus:outline-none text-slate-900 dark:text-slate-50 placeholder-slate-400 custom-scrollbar"
                rows="1"
              />

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-3 mb-0.5 rounded-full transition-colors flex-shrink-0 ${showEmojiPicker ? "text-blue-500 bg-blue-50 dark:bg-slate-800" : "text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
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
            </div>

            <button
              type="submit"
              disabled={!text.trim() && !imagePreview}
              className={`p-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg ${!text.trim() && !imagePreview ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 hover:scale-105 text-white shadow-blue-500/30"}`}
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
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
