import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const MessageBubble = ({ message, isSent }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [isDisintegrating, setIsDisintegrating] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (message.isGhost) {
      const age = Date.now() - new Date(message.createdAt).getTime();
      const remainingTime = 5000 - age;

      if (remainingTime <= 0) {
        setDeleted(true);
      } else {
        const timer = setTimeout(() => {
          setIsDisintegrating(true);
          setTimeout(() => {
            setDeleted(true);
            // We can also trigger the backend delete here for safety
            if (isSent) {
              axios.delete(`http://localhost:4500/api/messages/${message._id}`, { withCredentials: true }).catch(() => {});
            }
          }, 1000); // Wait for animation to finish
        }, remainingTime);
        return () => clearTimeout(timer);
      }
    }
  }, [message, isSent]);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    
    const menuWidth = 180; // approximate width of the menu
    const menuHeight = 100; // approximate height of the menu
    
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
      await axios.delete(`http://localhost:4500/api/messages/${message._id}`, {
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
      } max-w-md w-full bg-base-100 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 p-4`}>
        <div className="flex-1 w-0">
          <div className="flex flex-col gap-3 min-w-50">
            <p className="text-sm font-medium text-base-content">
              Delete this message?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1.5 text-xs font-medium text-base-content/80 hover:bg-base-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  executeDelete();
                }}
                className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    ), { duration: 2000, position: 'top-center' });
  };

  if (deleted) return null;

  return (
    <>
      <div className={`flex ${isSent ? "justify-end" : "justify-start"} mb-4 px-4`}>
        <div className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
          {/* Message Bubble */}
          <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            onContextMenu={handleContextMenu}
            className={`chat ${isSent ? "chat-end" : "chat-start"} relative`}
          >
            <motion.div
              animate={
                isDisintegrating
                  ? { opacity: 0, scale: 0.5, filter: "blur(10px)", rotate: 12 }
                  : isDeleting
                  ? { opacity: 0.5, scale: 0.95 }
                  : { opacity: 1, scale: 1, filter: "blur(0px)", rotate: 0 }
              }
              transition={{ duration: 0.3 }}
              className={`chat-bubble cursor-context-menu max-w-xs ${
                isSent
                  ? "bg-primary text-primary-content"
                  : "bg-base-100 text-base-content"
              } ${message.isGhost && !isDisintegrating ? "animate-pulse" : ""}`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="attachment"
                  className="rounded-lg mb-2 max-w-full max-h-60 object-cover border border-black/10 dark:border-white/10"
                />
              )}
              {message.text && (
                <p className="text-[15px] font-medium leading-relaxed tracking-wide">{message.text}</p>
              )}
              <div
                className={`text-[11px] font-semibold mt-1.5 flex items-center justify-end gap-1 ${isSent ? "text-primary-content/80" : "text-base-content/50"}`}
              >
                {message.isGhost && <span className="mr-1 drop-shadow-sm">👻</span>}
                {isSent && <span className="text-[14px] ml-0.5">✓✓</span>}
              </div>
            </motion.div>
          </motion.div>

          {/* Time Below Message */}
          <div className={`text-xs font-semibold mt-1 ${isSent ? "text-primary" : "text-base-content/70"}`}>
            {formatTime(message.createdAt)}
          </div>
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
              transition={{ duration: 0.15 }}
              style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
              className="fixed z-50 bg-base-100 border border-base-300 rounded-xl shadow-xl py-2 min-w-40 glass-panel"
            >
              {isSent && (
                <button
                  onClick={handleDelete}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-base-200 transition-colors flex items-center gap-2"
                >
                  <span>🗑️</span> Delete Message
                </button>
              )}
              <button
                onClick={closeContextMenu}
                className="w-full text-left px-4 py-2 text-sm text-base-content/80 hover:bg-base-200 transition-colors"
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
