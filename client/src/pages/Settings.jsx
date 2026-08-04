import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import toast from "react-hot-toast";

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const { setAuthUser } = useAuth();
  const navigate = useNavigate();

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone.",
      )
    )
      return;
    try {
      await axios.delete("http://localhost:4500/api/auth/account", {
        withCredentials: true,
      });
      setAuthUser(null);
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const isDark = theme === "dark";

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-linear-to-b from-blue-500 to-transparent pointer-events-none" />

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-16 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl z-50 shadow-sm transition-colors duration-300">
        <Link
          to="/chat"
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 font-medium"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span> 
          <span>Back to Chat</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pt-24 pb-8 px-8 flex justify-center z-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8 transition-colors duration-300">
            App Settings
          </h1>

          <div className="space-y-4">
            <div
              onClick={toggleTheme}
              className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 glass-panel flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  Dark Mode
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle dark theme
                </p>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${isDark ? "bg-blue-600" : "bg-slate-300"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isDark ? "right-1" : "left-1"}`}
                ></div>
              </div>
            </div>

            <div
              onClick={() => setNotifications(!notifications)}
              className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 glass-panel flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                  Notifications
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Message sound and popups
                </p>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${notifications ? "bg-blue-600" : "bg-slate-300"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? "right-1" : "left-1"}`}
                ></div>
              </div>
            </div>

            <div
              onClick={handleDeleteAccount}
              className="bg-red-50 dark:bg-red-500/10 p-6 rounded-xl border border-red-200 dark:border-red-500/20 glass-panel cursor-pointer hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors text-center mt-8"
            >
              <h3 className="font-semibold text-red-600 dark:text-red-500">
                Delete Account
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
