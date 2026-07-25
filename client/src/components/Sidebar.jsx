import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { authUser, setAuthUser } = useAuth();
  const { onlineUsers, selectedUser, setSelectedUser } = useChat();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <div className="relative w-[84px] flex-shrink-0 h-full z-30">
      <div className="absolute top-0 left-0 h-full w-[84px] hover:w-[320px] bg-white/90 dark:bg-[#111b21]/95 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-2xl transition-all duration-300 overflow-hidden group">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 transition-colors duration-300 w-[320px]">
          <Link
            to="/profile"
            className="flex items-center gap-4 cursor-pointer group/avatar"
          >
            <div className="relative flex-shrink-0 ml-1">
              <img
                src={authUser?.profilePic || "/logo.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover shadow-sm group-hover/avatar:shadow-blue-500/30 transition-all duration-300 group-hover/avatar:scale-105 border border-slate-200 dark:border-slate-700"
              />
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#0b141a]" />
            </div>
            <h2 className="font-bold text-slate-900 dark:text-slate-50 truncate w-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {authUser?.fullName}
            </h2>
          </Link>
        </div>

        {/* Search */}
        <div className="p-4 bg-transparent transition-colors duration-300 relative w-[320px]">
          <div className="absolute left-8 top-7 text-slate-400">🔍</div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-[288px] pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 opacity-0 group-hover:opacity-100"
          />
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar w-[320px]">
          {users
            .filter((user) =>
              user.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((user) => {
              const isOnline = onlineUsers.includes(user._id);
              const isSelected = selectedUser?._id === user._id;

              return (
                <div
                  key={user._id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-4 relative overflow-hidden w-[304px]
                  ${isSelected ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}
                `}
                >
                  {/* Active Indicator Bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full shadow-md z-10"></div>
                  )}

                  <div className="relative flex-shrink-0 ml-1">
                    <img
                      src={user.profilePic || "/logo.png"}
                      alt="user"
                      className={`w-12 h-12 rounded-full object-cover transition-transform ${isSelected ? "border-2 border-blue-500" : "border border-slate-200 dark:border-slate-700"}`}
                    />
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-[#0b141a]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-2">
                    <h3
                      className={`font-semibold text-sm truncate ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-slate-50"}`}
                    >
                      {user.fullName}
                    </h3>
                    <p
                      className={`text-xs mt-0.5 truncate ${isOnline ? "text-blue-500 dark:text-blue-400 font-medium" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {isOnline ? "Online now" : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Footer (Settings & Logout) */}
        <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col group-hover:flex-row items-start group-hover:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20 transition-colors duration-300 w-[320px]">
          <Link
            to="/settings"
            className="flex items-center gap-4 p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group-hover:w-[130px] overflow-hidden ml-1"
          >
            <span className="text-xl flex-shrink-0">⚙️</span>
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Settings
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all group-hover:w-[130px] overflow-hidden ml-1 group-hover:ml-0 group-hover:mr-4"
          >
            <span className="text-xl flex-shrink-0">⎋</span>
            <span className="font-semibold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
