import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMoreVertical, FiMessageSquare, FiSettings, FiLogOut } from "react-icons/fi";

const Sidebar = () => {
  const { authUser, setAuthUser } = useAuth();
  const { onlineUsers, selectedUser, setSelectedUser, typingUsers } = useChat();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/users`, {
          withCredentials: true,
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      }
    };
    fetchUsers();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/auth/logout`,
        {},
        { withCredentials: true },
      );
      setAuthUser(null);
      localStorage.removeItem("selectedUser");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-shrink-0 h-full w-full lg:w-[400px] bg-white dark:bg-[#111b21] flex flex-col border-r border-gray-200 dark:border-gray-800 z-30 min-h-0">
      
      {/* Header */}
      <div className="h-[60px] px-3 sm:px-4 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between shrink-0">
        <Link to="/profile" className="flex items-center cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img src={authUser?.profilePic || "/logo.png"} alt="avatar" className="w-full h-full object-cover" />
          </div>
        </Link>
        <div className="flex items-center gap-4 text-gray-500 dark:text-[#aebac1] relative">
          <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors">
            <FiMessageSquare size={20} />
          </button>
          <button 
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2a3942] transition-colors"
            onClick={() => setShowMenu(!showMenu)}
          >
            <FiMoreVertical size={20} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)}></div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-12 w-48 bg-white dark:bg-[#233138] rounded-md shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 origin-top-right"
                >
                  <Link to="/settings" className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] flex items-center gap-3 text-gray-700 dark:text-gray-200">
                    <FiSettings size={18} /> Settings
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-[#f5f6f6] dark:hover:bg-[#111b21] flex items-center gap-3 text-red-600">
                    <FiLogOut size={18} /> Log out
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2 bg-white dark:bg-[#111b21] border-b border-gray-200 dark:border-gray-800 shrink-0">
        <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1.5 gap-3">
          <span className="text-gray-500 dark:text-[#aebac1]">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M15.009 13.805h-.636l-.22-.219a5.184 5.184 0 0 0 1.256-3.386 5.207 5.207 0 1 0-5.207 5.208 5.183 5.183 0 0 0 3.385-1.255l.221.22v.635l4.004 3.999 1.194-1.195-3.997-4.007zm-5.608 0a3.601 3.601 0 1 1 0-7.203 3.601 3.601 0 0 1 0 7.203z"></path>
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search or start new chat"
            className="w-full bg-transparent border-none focus:outline-none text-gray-900 dark:text-gray-100 text-sm placeholder-gray-500"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto no-scrollbar custom-scrollbar bg-white dark:bg-[#111b21] min-h-0">
        {users
          .filter((user) => user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedUser?._id === user._id;

            return (
              <div
                key={user._id}
                onClick={() => {
                  setSelectedUser(user);
                  const drawer = document.getElementById("mobile-sidebar-drawer");
                  if (drawer) drawer.checked = false;
                }}
                className={`flex items-center gap-4 px-3 py-2.5 cursor-pointer transition-colors relative group
                  ${isSelected ? "bg-[#f0f2f5] dark:bg-[#2a3942]" : "hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]"}
                `}
              >
                <div className="relative shrink-0">
                  <img 
                    src={user.profilePic || "/logo.png"} 
                    alt="user" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] dark:bg-[#00a884] border-2 border-white dark:border-[#111b21] rounded-full"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-gray-800/50 pb-3 pt-1 group-last:border-none">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-[17px] truncate">
                      {user.fullName}
                    </h3>
                    {!typingUsers.includes(user._id) && (
                      <span className="text-xs text-gray-500 dark:text-[#8696a0] whitespace-nowrap ml-2 shrink-0">
                        {isOnline ? "Online" : ""}
                      </span>
                    )}
                  </div>
                  {typingUsers.includes(user._id) ? (
                    <p className="text-[14px] text-[#00a884] font-medium truncate animate-pulse">
                      typing...
                    </p>
                  ) : (
                    <p className="text-[14px] text-gray-500 dark:text-[#8696a0] truncate">
                      Hey there! I am using RWave.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Sidebar;
