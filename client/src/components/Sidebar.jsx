import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const { authUser, setAuthUser } = useAuth();
  const { onlineUsers, selectedUser, setSelectedUser } = useChat();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:4500/api/users", {
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
        "http://localhost:4500/api/auth/logout",
        {},
        { withCredentials: true },
      );
      setAuthUser(null);
      localStorage.removeItem("selectedUser");
    } catch (error) {
      console.error(error);
    }
  };

  const sidebarVariants = {
    collapsed: { width: 84 },
    expanded: { width: 320 }
  };

  return (
    <div className="relative flex-shrink-0 h-full z-30 w-[84px]">
      <motion.div 
        className="absolute top-0 left-0 h-full bg-base-100/95 backdrop-blur-xl border-r border-base-300 flex flex-col shadow-2xl overflow-hidden"
        initial="collapsed"
        animate={isHovered ? "expanded" : "collapsed"}
        variants={sidebarVariants}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between bg-base-200/50 w-[320px]">
          <Link to="/profile" className="flex items-center gap-4 cursor-pointer">
            <div className="avatar indicator ml-1">
              <span className="indicator-item badge badge-success badge-xs"></span>
              <div className="w-12 h-12 rounded-full border border-base-300 shadow-sm">
                <img src={authUser?.profilePic || "/logo.png"} alt="avatar" />
              </div>
            </div>
            <motion.h2 
              className="font-bold text-base-content truncate w-48"
              animate={{ opacity: isHovered ? 1 : 0 }}
            >
              {authUser?.fullName}
            </motion.h2>
          </Link>
        </div>

        {/* Search */}
        <div className="p-4 bg-transparent relative w-[320px]">
          <div className="absolute left-8 top-7 text-base-content/50">🔍</div>
          <motion.input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="input input-bordered w-[288px] pl-10 rounded-xl bg-base-200 border-transparent focus:border-primary focus:bg-base-100 text-sm"
            animate={{ opacity: isHovered ? 1 : 0 }}
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 space-y-1 custom-scrollbar w-[320px]">
          <AnimatePresence>
            {users
              .filter((user) => user.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((user, index) => {
                const isOnline = onlineUsers.includes(user._id);
                const isSelected = selectedUser?._id === user._id;

                return (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-xl cursor-pointer transition-colors duration-200 flex items-center gap-4 relative overflow-hidden w-[304px]
                    ${isSelected ? "bg-base-200" : "hover:bg-base-200/50"}
                  `}
                  >
                    {isSelected && (
                      <motion.div layoutId="activeIndicator" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-md z-10" />
                    )}

                    <div className="avatar indicator ml-1 flex-shrink-0">
                      {isOnline && <span className="indicator-item badge badge-success badge-xs"></span>}
                      <div className={`w-12 h-12 rounded-full transition-transform ${isSelected ? "border-2 border-primary" : "border border-base-300"}`}>
                        <img src={user.profilePic || "/logo.png"} alt="user" />
                      </div>
                    </div>

                    <motion.div 
                      className="flex-1 min-w-0 pr-2"
                      animate={{ opacity: isHovered ? 1 : 0 }}
                    >
                      <h3 className={`font-semibold text-sm truncate ${isSelected ? "text-primary" : "text-base-content"}`}>
                        {user.fullName}
                      </h3>
                      <p className={`text-xs mt-0.5 truncate ${isOnline ? "text-secondary font-medium" : "text-base-content/70"}`}>
                        {isOnline ? "Online now" : "Offline"}
                      </p>
                    </motion.div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-base-300 flex flex-col items-start gap-4 bg-base-200/50 w-[320px]">
          <Link to="/settings" className="flex items-center gap-4 p-2 text-base-content/70 hover:text-primary hover:bg-base-200 rounded-xl transition-all ml-1 overflow-hidden w-[130px]">
            <span className="text-xl flex-shrink-0">⚙️</span>
            <motion.span animate={{ opacity: isHovered ? 1 : 0 }} className="font-semibold text-sm whitespace-nowrap">Settings</motion.span>
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-4 p-2 text-base-content/70 hover:text-error hover:bg-error/10 rounded-xl transition-all ml-1 overflow-hidden w-[130px]">
            <span className="text-xl flex-shrink-0">⎋</span>
            <motion.span animate={{ opacity: isHovered ? 1 : 0 }} className="font-semibold text-sm whitespace-nowrap">Logout</motion.span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Sidebar;
