import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "../context/ChatContext";

const MessageBubble = ({ message, isSent }) => {
  const { socket, setMessages } = useChat();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // If we are the receiver and the message is not seen yet, notify the sender immediately
    if (!isSent && message.status !== "seen" && socket && message._id) {
      socket.emit("message-seen", { messageId: message._id, receiverId: message.senderId });
    }
  }, [isSent, message._id, message.status, message.senderId, socket]);

  useEffect(() => {
    if (message.isGhost) {
      let timer;
      const startDisintegration = () => {
        timer = setTimeout(() => {
          setIsDisintegrating(true);
          setTimeout(() => {
            setDeleted(true);
            if (isSent) {
              axios.delete(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/messages/${message._id}`, { withCredentials: true }).catch(() => {});
            }
          }, 1000);
        }, 15000); // 15 seconds after being seen
      };

      if (!isSent) {
        startDisintegration();
      } else {
        // We are the sender. We wait until status is "seen".
        if (message.status === "seen") {
          startDisintegration();
        }
      }

      return () => clearTimeout(timer);
    }
  }, [message.isGhost, message.status, isSent, message._id, message.senderId]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    const menuWidth = 180;
    const menuHeight = 100;
    
    let xPos = e.clientX - 2;
    let yPos = e.clientY - 4;
    
    if (xPos + menuWidth > window.innerWidth) {
      xPos = window.innerWidth - menuWidth - 10;
    }
    
    if (yPos + menuHeight > window.innerHeight) {
      yPos = window.innerHeight - menuHeight - 10;
    }

    setContextMenu({
      mouseX: xPos,
      mouseY: yPos,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const executeDelete = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/messages/${message._id}`, {
        withCredentials: true,
      });
      setDeleted(true);
      toast.success("Message deleted", { duration: 2000 });
    } catch (error) {
      console.error("Failed to delete message", error);
      setIsDeleting(false);
      toast.error(`Failed to delete message: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDelete = () => {
    closeContextMenu();
    
    toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white dark:bg-[#202c33] shadow-2xl rounded-lg pointer-events-auto flex flex-col p-4 border border-gray-100 dark:border-gray-800`}>
        <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-4">
          Delete this message?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm font-medium text-[#00a884] hover:bg-gray-100 dark:hover:bg-[#111b21] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              executeDelete();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#00a884] hover:bg-[#008f6f] rounded transition-colors shadow-sm"
          >
            Delete for me
          </button>
        </div>
      </div>
    ), { duration: 2000, position: 'top-center' });
  };

  const executeEdit = async (newText) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/messages/${message._id}`, 
        { text: newText },
        { withCredentials: true }
      );
      setMessages((prev) => prev.map((msg) => msg._id === message._id ? { ...msg, text: newText } : msg));
      toast.success("Message edited", { duration: 2000 });
    } catch (error) {
      console.error("Failed to edit message", error);
      toast.error(`Failed to edit message: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleEdit = () => {
    closeContextMenu();
    let newText = message.text;
    
    toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-sm w-full bg-white dark:bg-[#202c33] shadow-2xl rounded-lg pointer-events-auto flex flex-col p-4 border border-gray-100 dark:border-gray-800`}>
        <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100 mb-4">
          Edit message
        </p>
        <textarea 
          defaultValue={newText}
          onChange={(e) => newText = e.target.value}
          className="w-full bg-gray-100 dark:bg-[#2a3942] text-gray-900 dark:text-white rounded-md p-2 mb-4 focus:outline-none resize-none"
          rows="3"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm font-medium text-[#00a884] hover:bg-gray-100 dark:hover:bg-[#111b21] rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              if(newText.trim() && newText !== message.text) {
                executeEdit(newText.trim());
              }
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#00a884] hover:bg-[#008f6f] rounded transition-colors shadow-sm"
          >
            Save
          </button>
        </div>
      </div>
    ), { duration: Infinity, position: 'top-center' });
  };

  if (deleted) return null;

  const isEditable = isSent && (Date.now() - new Date(message.createdAt).getTime() <= 3600000);

  return (
    <>
      <div className={`flex w-full mb-1 sm:mb-2 ${isSent ? "justify-end" : "justify-start"}`}>
        <div className="flex flex-col max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, transformOrigin: isSent ? "right bottom" : "left bottom" }}
            animate={
              isDisintegrating
                ? { opacity: 0, scale: 0.5, filter: "blur(10px)", rotate: 12 }
                : isDeleting
                ? { opacity: 0.5, scale: 0.95 }
                : { opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }
            }
            transition={{ duration: 0.2 }}
            onContextMenu={handleContextMenu}
            className={`relative rounded-lg px-2 pt-1.5 pb-2 shadow-sm ${
              isSent
                ? "bg-[#d9fdd3] dark:bg-[#005c4b] rounded-tr-none text-gray-900 dark:text-[#e9edef]"
                : "bg-white dark:bg-[#202c33] rounded-tl-none text-gray-900 dark:text-[#e9edef]"
            } ${message.isGhost && !isDisintegrating ? "animate-pulse border border-purple-300 dark:border-purple-800" : ""}`}
          >
            {/* WhatsApp Tail */}
            <span className={`absolute top-0 w-2 h-3 ${isSent ? "-right-2 text-[#d9fdd3] dark:text-[#005c4b]" : "-left-2 text-white dark:text-[#202c33]"}`}>
              <svg viewBox="0 0 8 13" width="8" height="13" fill="currentColor">
                {isSent ? (
                  <path d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z" />
                ) : (
                  <path d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z" />
                )}
              </svg>
            </span>

            {message.image && (
              <div className="p-1 -mx-1 -mt-0.5">
                <img
                  src={message.image}
                  alt="attachment"
                  className="rounded-md max-w-full max-h-[300px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                />
              </div>
            )}
            
            <div className="flex flex-wrap items-end gap-2">
              {message.text && (
                <p className="text-[14.5px] leading-[19px] whitespace-pre-wrap break-words inline pr-2">
                  {message.text}
                  {/* Invisible spacer to push time to right if short message */}
                  <span className="inline-block w-12 invisible">&#8203;</span>
                </p>
              )}
              
              <div className={`flex items-center gap-1 text-[11px] leading-3 float-right ${isSent ? "text-gray-500 dark:text-white/60" : "text-gray-500 dark:text-white/60"} mt-1 -mb-1 relative bottom-0 right-0 ${!message.text && message.image ? "absolute bottom-2 right-2 bg-black/40 text-white rounded-full px-2 py-1 backdrop-blur-sm" : ""}`}>
                {message.isGhost && <span className="mr-0.5">👻</span>}
                <span>{formatTime(message.createdAt)}</span>
                {isSent && (
                  <span
                    className="inline-flex items-center ml-0.5"
                    title={
                      message.status === "seen"
                        ? "Seen"
                        : message.status === "delivered"
                        ? "Delivered"
                        : "Sent"
                    }
                  >
                    {message.status === "seen" ? (
                      /* Double Blue Tick (Seen) */
                      <svg
                        viewBox="0 0 16 15"
                        width="16"
                        height="15"
                        className="text-[#53bdeb] dark:text-[#53bdeb] drop-shadow-xs"
                      >
                        <path
                          fill="currentColor"
                          d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                        />
                      </svg>
                    ) : message.status === "delivered" ? (
                      /* Double Gray Tick (Delivered) */
                      <svg
                        viewBox="0 0 16 15"
                        width="16"
                        height="15"
                        className="text-gray-400 dark:text-gray-400"
                      >
                        <path
                          fill="currentColor"
                          d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                        />
                      </svg>
                    ) : (
                      /* Single Gray Tick (Sent) */
                      <svg
                        viewBox="0 0 16 15"
                        width="12"
                        height="15"
                        className="text-gray-400 dark:text-gray-400"
                      >
                        <path
                          fill="currentColor"
                          d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                        />
                      </svg>
                    )}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right-Click Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={closeContextMenu}
              onContextMenu={(e) => {
                e.preventDefault();
                closeContextMenu();
              }}
            ></div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
              className="fixed z-50 bg-white dark:bg-[#233138] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-2 min-w-44"
            >
              {isSent && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] transition-colors"
                >
                  Delete message
                </button>
              )}
              {isEditable && (
                <button
                  onClick={handleEdit}
                  className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] transition-colors"
                >
                  Edit message
                </button>
              )}
              <button
                onClick={closeContextMenu}
                className="w-full text-left px-4 py-3 text-sm text-gray-800 dark:text-gray-200 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MessageBubble;
