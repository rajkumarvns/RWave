import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { useAuth } from "../context/AuthContext";
import { useTheme, chatWallpapers } from "../context/ThemeContext";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { FiSearch, FiMoreVertical, FiPaperclip, FiSmile, FiSend, FiX, FiPhone, FiVideo, FiMenu } from "react-icons/fi";
import { useCall } from "../context/CallContext";

const ChatWindow = () => {
  const {
    selectedUser,
    setSelectedUser,
    messages,
    sendMessage,
    isMessagesLoading,
    onlineUsers,
    typingUsers,
    socket,
  } = useChat();
  const { authUser, setAuthUser } = useAuth();
  const { initiateCall } = useCall();
  const { chatWallpaper } = useTheme();
  const currentWallpaper = chatWallpapers[chatWallpaper] || chatWallpapers.default;

  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const menuRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#222e35] transition-colors duration-300 relative border-b-8 border-[#25d366] overflow-hidden h-full w-full">
        <div className="absolute top-4 left-4 lg:hidden z-50">
          <label htmlFor="mobile-sidebar-drawer" className="btn btn-circle btn-ghost bg-white/90 dark:bg-[#2a3942] shadow-md drawer-button text-gray-700 dark:text-gray-200">
            <FiMenu size={22} />
          </label>
        </div>
        
        <div className="text-center z-10 p-6 sm:p-12 max-w-md">
          <div className="w-56 sm:w-80 h-28 sm:h-40 bg-contain bg-no-repeat bg-center mx-auto mb-6 sm:mb-8" style={{backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yO/r/fsWUqRoOsPu.png')"}}></div>
          <h2 className="text-2xl sm:text-3xl font-light text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
            RWave Web
          </h2>
          <p className="text-gray-500 dark:text-[#8696a0] text-[13px] sm:text-[14px]">
            Send and receive messages without keeping your phone online.<br className="hidden sm:inline" />
            Use RWave on up to 4 linked devices and 1 phone at the same time.
          </p>
          <div className="mt-6 text-[12px] text-gray-400 flex items-center justify-center gap-1">
            <span>🔒 End-to-end encrypted</span>
          </div>

          <label htmlFor="mobile-sidebar-drawer" className="lg:hidden mt-6 btn btn-primary btn-sm drawer-button gap-2 shadow-sm">
            <FiMenu size={16} /> Open Chats
          </label>
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
      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.05);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSending) return;

    setIsSending(true);
    try {
      await sendMessage({ text: text.trim(), image: imagePreview, isGhost: isGhostMode });
      playSendSound();
      setText("");
      removeImage();
      setShowEmojiPicker(false);
      
      if (socket && selectedUser) {
        socket.emit("stop-typing", { receiverId: selectedUser._id });
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
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

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stop-typing", { receiverId: selectedUser._id });
      }, 2000);
    }
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
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] transition-colors duration-300 relative min-h-0">
      
      {/* Background Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-5 mix-blend-multiply dark:mix-blend-normal"
        style={{
          backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yO/r/fsWUqRoOsPu.png')",
          backgroundRepeat: "repeat",
        }}
      ></div>

      {/* Header */}
      <div className="h-[60px] px-4 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between shrink-0 z-30 border-b border-transparent dark:border-gray-800 shadow-sm md:shadow-none">
        <AnimatePresence mode="wait">
          {showSearch ? (
            <motion.div 
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center w-full gap-4"
            >
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchQuery("");
                }}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 4l1.4 1.4L7.8 11H20v2H7.8l5.6 5.6L12 20l-8-8 8-8z"></path></svg>
              </button>
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="flex-1 px-4 py-1.5 bg-white dark:bg-[#2a3942] rounded-lg focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
              />
            </motion.div>
          ) : (
            <motion.div 
              key="header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between w-full h-full"
            >
              <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0">
                <label htmlFor="mobile-sidebar-drawer" className="lg:hidden btn btn-ghost btn-circle btn-sm drawer-button shrink-0 -ml-1 text-gray-600 dark:text-[#aebac1]" title="Open Sidebar">
                  <FiMenu size={22} />
                </label>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0">
                  <img src={selectedUser.profilePic || "/logo.png"} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-center h-full min-w-0">
                  <h3 className="text-[15px] sm:text-[16px] text-gray-900 dark:text-gray-100 font-medium truncate">
                    {selectedUser.fullName}
                    {isBlocked && <span className="ml-1.5 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Blocked</span>}
                  </h3>
                  {typingUsers.includes(selectedUser?._id) ? (
                    <p className="text-[12px] sm:text-[13px] text-[#00a884] font-medium leading-none mt-0.5 animate-pulse truncate">
                      typing...
                    </p>
                  ) : (
                    <p className="text-[12px] sm:text-[13px] text-gray-500 dark:text-[#8696a0] leading-none mt-0.5 truncate">
                      {isOnline ? "Online" : "click here for contact info"}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 relative text-gray-500 dark:text-[#aebac1] shrink-0" ref={menuRef}>
                <button
                  onClick={() => initiateCall(selectedUser, "video")}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors"
                  title="Video Call"
                >
                  <FiVideo size={19} />
                </button>
                <button
                  onClick={() => initiateCall(selectedUser, "audio")}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors"
                  title="Audio Call"
                >
                  <FiPhone size={19} />
                </button>
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors"
                  title="Search"
                >
                  <FiSearch size={19} />
                </button>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors"
                  title="Menu"
                >
                  <FiMoreVertical size={19} />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-12 w-48 bg-white dark:bg-[#233138] rounded-md shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[60] origin-top-right"
                    >
                      <button onClick={() => { setSelectedUser(null); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] text-gray-700 dark:text-gray-200 text-sm">
                        Close chat
                      </button>
                      <button onClick={handleClearHistory} className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] text-gray-700 dark:text-gray-200 text-sm">
                        Clear messages
                      </button>
                      
                      {isBlocked ? (
                        <button onClick={handleUnblockUser} className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] text-green-600 text-sm">
                          Unblock
                        </button>
                      ) : (
                        <button onClick={handleBlockUser} className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] text-red-600 text-sm">
                          Block
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
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 md:px-[6%] lg:px-[8%] py-3 sm:py-4 no-scrollbar custom-scrollbar z-10 relative bg-transparent flex flex-col min-h-0"
        onClick={() => setShowEmojiPicker(false)}
      >
        <div className="flex-1 flex flex-col min-h-0">
          <div className="mt-auto space-y-1">
            {isMessagesLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00a884]"></div>
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="text-center text-gray-500 bg-white/60 dark:bg-[#182229]/80 backdrop-blur-xs p-3 rounded-lg mx-auto my-4 text-xs sm:text-sm max-w-sm border border-amber-200/50 dark:border-none shadow-xs">
                Messages are end-to-end encrypted. No one outside of this chat, not even RWave, can read or listen to them.
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
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] z-10 min-h-[56px] sm:min-h-[62px] flex items-end py-2 px-2 sm:px-4 shrink-0 relative">
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-[66px] left-2 sm:left-4 z-50 shadow-2xl rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 max-w-[calc(100vw-20px)] sm:max-w-none"
            >
              <EmojiPicker onEmojiClick={onEmojiClick} theme="auto" width={typeof window !== "undefined" && window.innerWidth < 420 ? 300 : 350} height={380} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {imagePreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bottom-[66px] left-2 sm:left-4 bg-[#f0f2f5] dark:bg-[#202c33] p-2 sm:p-3 rounded-lg shadow-xl border border-gray-300 dark:border-gray-700"
            >
              <img
                src={imagePreview}
                alt="Preview"
                className="h-32 sm:h-40 rounded object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-500 transition-colors"
              >
                <FiX />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {isBlocked ? (
          <div className="w-full text-center text-gray-500 text-sm py-2">
            You blocked this contact. Tap to unblock.
          </div>
        ) : (
          <form
            onSubmit={handleSendMessage}
            className="flex items-end w-full gap-1.5 sm:gap-3"
          >
            <div className="flex gap-0.5 sm:gap-1 mb-1 shrink-0 text-gray-500 dark:text-[#aebac1]">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors ${showEmojiPicker ? "text-[#00a884]" : ""}`}
                title="Emoji"
              >
                <FiSmile size={22} />
              </button>
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors"
                title="Attach"
              >
                <FiPaperclip size={20} className="transform -rotate-45" />
              </button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>

            <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg min-h-[40px] flex items-center px-3 sm:px-4 relative">
              <textarea
                value={text}
                onChange={handleTextChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message"
                className="w-full bg-transparent resize-none py-2 max-h-[120px] focus:outline-none text-gray-900 dark:text-gray-100 text-[14px] sm:text-[15px] placeholder-gray-500 leading-snug custom-scrollbar"
                rows="1"
              />
              
              {/* Ghost Mode Toggle */}
              <button
                type="button"
                onClick={() => setIsGhostMode(!isGhostMode)}
                className={`absolute right-2 p-1.5 rounded-md transition-colors ${isGhostMode ? "text-purple-500 bg-purple-100 dark:bg-purple-900/30" : "text-gray-400 hover:text-purple-500"}`}
                title="Ghost Mode (Disappearing Messages)"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              disabled={(!text.trim() && !imagePreview) || isBlocked || isSending}
              className={`p-2.5 sm:p-3 mb-0.5 shrink-0 rounded-full flex items-center justify-center transition-colors 
                ${(!text.trim() && !imagePreview) || isBlocked || isSending 
                  ? "text-gray-400 cursor-not-allowed" 
                  : "text-[#00a884] hover:bg-gray-200 dark:hover:bg-[#2a3942]"}`}
            >
              <FiSend size={22} className="transform translate-x-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
