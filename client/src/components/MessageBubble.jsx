import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
      toast.success("Message deleted");
    } catch (error) {
      console.error("Failed to delete message", error);
      setIsDeleting(false);
      toast.error("Failed to delete message");
    }
  };

  const handleDelete = () => {
    closeContextMenu();
    
    toast.custom((t) => (
      <div className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white dark:bg-slate-800 shadow-lg rounded-2xl pointer-events-auto flex ring-1 ring-black/5 dark:ring-white/10 p-4`}>
        <div className="flex-1 w-0">
          <div className="flex flex-col gap-3 min-w-[200px]">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Delete this message?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
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
    ), { duration: 5000, position: 'top-center' });
  };

  if (deleted) return null;

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className={`flex ${isSent ? "justify-end" : "justify-start"} animate-fade-in-up relative`}
      >
        <div
          className={`max-w-[75%] px-5 py-3 shadow-md cursor-context-menu transition-all duration-500 transform hover:-translate-y-0.5 ${
            isSent
              ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl rounded-br-sm shadow-indigo-500/30"
              : "bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 rounded-3xl rounded-bl-sm shadow-slate-200/50 dark:shadow-slate-900/50"
          } ${isDeleting ? "opacity-50 scale-95" : ""} ${
            isDisintegrating ? "opacity-0 scale-50 blur-xl rotate-12" : ""
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
            className={`text-[11px] font-semibold mt-1.5 flex items-center justify-end gap-1 ${isSent ? "text-indigo-100/80" : "text-slate-500/80 dark:text-slate-400/80"}`}
          >
            {message.isGhost && <span className="mr-1 drop-shadow-sm">👻</span>}
            <span>{formatTime(message.createdAt)}</span>
            {isSent && <span className="text-[14px] ml-0.5">✓✓</span>}
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
