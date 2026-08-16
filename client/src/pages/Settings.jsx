import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme, themes, chatWallpapers } from "../context/ThemeContext";
import axios from "axios";
import toast from "react-hot-toast";

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const { setAuthUser } = useAuth();
  const { colorTheme, setColorTheme, chatWallpaper, setChatWallpaper } = useTheme();
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

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-linear-to-b from-primary to-transparent pointer-events-none" />

      {/* Navbar */}
      <div className="fixed top-0 left-0 w-full h-16 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center px-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl z-50 shadow-sm transition-colors duration-300">
        <Link
          to="/chat"
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-secondary hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all duration-300 font-medium"
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
                className={`w-10 h-6 rounded-full relative transition-colors ${notifications ? "bg-primary" : "bg-slate-300"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications ? "right-1" : "left-1"}`}
                ></div>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 glass-panel">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Color Theme
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => setColorTheme(key)}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${colorTheme === key ? "border-primary scale-105" : "border-transparent hover:scale-105"}`}
                    style={{ backgroundColor: theme.primary }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {/* Chat Wallpaper Selector */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 glass-panel">
              <h3 className="font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Chat Background
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(chatWallpapers).map(([key, wallpaper]) => (
                  <button
                    key={key}
                    onClick={() => setChatWallpaper(key)}
                    className={`relative h-20 rounded-xl border-2 overflow-hidden transition-all ${chatWallpaper === key ? "border-primary shadow-lg" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"}`}
                  >
                    <div className="absolute inset-0 bg-[#f4f7f6] dark:bg-[#0b141a]"></div>
                    <div
                      className="absolute inset-0 bg-repeat"
                      style={{
                        backgroundImage: wallpaper.url ? `url('${wallpaper.url}')` : 'none',
                        backgroundColor: wallpaper.overlayColor || 'transparent',
                        opacity: wallpaper.opacity || 0.05,
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm font-medium">{wallpaper.name}</span>
                    </div>
                    <div className="absolute bottom-1 left-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {wallpaper.name}
                    </div>
                  </button>
                ))}
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
