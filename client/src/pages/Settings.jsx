import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const Settings = () => {
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

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-base-100 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-linear-to-b from-primary to-transparent pointer-events-none" />

      {/* Navbar */}
      <div className="w-full h-16 border-b border-base-300 flex flex-shrink-0 items-center px-6 bg-base-100/60 backdrop-blur-xl z-50 shadow-sm transition-colors duration-300">
        <Link
          to="/chat"
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-base-content/80 hover:text-primary hover:bg-base-200 transition-all duration-300 font-medium"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span> 
          <span>Back to Chat</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-6 px-4 sm:px-8 flex justify-center z-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-base-content mb-8 transition-colors duration-300">
            App Settings
          </h1>

          <div className="space-y-4">

            <div
              onClick={() => setNotifications(!notifications)}
              className="bg-base-200 p-6 rounded-xl border border-base-300 glass-panel flex justify-between items-center cursor-pointer hover:bg-base-300 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-base-content">
                  Notifications
                </h3>
                <p className="text-xs text-base-content/70">
                  Message sound and popups
                </p>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-colors ${notifications ? "bg-primary" : "bg-base-300"}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-base-100 rounded-full transition-transform ${notifications ? "right-1" : "left-1"}`}
                ></div>
              </div>
            </div>

            <div
              onClick={handleDeleteAccount}
              className="bg-error/10 p-6 rounded-xl border border-error/20 glass-panel cursor-pointer hover:bg-error/20 transition-colors text-center mt-8"
            >
              <h3 className="font-semibold text-error">
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
