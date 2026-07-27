import React, { useState, useEffect } from "react";
import axios from "axios";

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
    setContextMenu({
      mouseX: e.clientX - 2,
      mouseY: e.clientY - 4,
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleDelete = async () => {
    closeContextMenu();
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:4500/api/messages/${message._id}`, {
        withCredentials: true,
      });
      setDeleted(true);
    } catch (error) {
      console.error("Failed to delete message", error);
      setIsDeleting(false);
    }
  };

  if (deleted) return null;

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className={`flex ${isSent ? "justify-end" : "justify-start"} animate-fade-in-up relative`}
      >
        <div
          className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm cursor-context-menu transition-all duration-1000 transform ${
            isSent
              ? "bg-blue-600 text-white rounded-br-none shadow-blue-500/20"
              : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-slate-50 rounded-bl-none"
          } ${isDeleting ? "opacity-50" : ""} ${
            isDisintegrating ? "opacity-0 scale-50 blur-md rotate-12" : ""
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
            <p className="text-sm leading-relaxed">{message.text}</p>
          )}
          <div
            className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isSent ? "text-blue-200" : "text-slate-500 dark:text-slate-400"}`}
          >
            {message.isGhost && <span className="mr-1">👻</span>}
            <span>{formatTime(message.createdAt)}</span>
            {isSent && <span className="text-[12px]">✓✓</span>}
          </div>
        </div>
      </div>

      {/* Right-Click Context Menu */}
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

          <div
            style={{ top: contextMenu.mouseY, left: contextMenu.mouseX }}
            className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-2 min-w-[160px] glass-panel animate-fade-in-up transition-colors duration-300"
          >
            {isSent && (
              <button
                onClick={handleDelete}
                className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
              >
                <span>🗑️</span> Delete Message
              </button>
            )}
            <button
              onClick={closeContextMenu}
              className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default MessageBubble;
