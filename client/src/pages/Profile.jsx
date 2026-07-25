import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { authUser, setAuthUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(authUser?.fullName || "");
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      try {
        setIsUpdating(true);
        const response = await axios.put(
          "http://localhost:4500/api/auth/profile",
          { profilePic: base64Image },
          {
            withCredentials: true,
          },
        );
        setAuthUser(response.data);
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error("Error updating profile");
      } finally {
        setIsUpdating(false);
      }
    };
  };

  const handleNameSave = async () => {
    if (!editName.trim()) return setIsEditingName(false);
    if (editName === authUser?.fullName) return setIsEditingName(false);

    try {
      setIsUpdating(true);
      const response = await axios.put(
        "http://localhost:4500/api/auth/profile",
        { fullName: editName },
        {
          withCredentials: true,
        },
      );
      setAuthUser(response.data);
      toast.success("Name updated successfully!");
    } catch (error) {
      toast.error("Error updating name");
    } finally {
      setIsUpdating(false);
      setIsEditingName(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-linear-to-b from-blue-500 to-transparent pointer-events-none" />

      {/* Navbar */}
      <div className="h-16 border-b border-slate-200 dark:border-slate-700/50 flex items-center px-6 bg-white/80 dark:bg-slate-800/80 glass-panel z-10 shadow-sm transition-colors duration-300">
        <Link
          to="/chat"
          className="text-slate-600 dark:text-slate-400 hover:text-blue-500 flex items-center gap-2 transition-colors"
        >
          <span>← Back to Chat</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex justify-center z-10">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-8 transition-colors duration-300">
            Profile Settings
          </h1>

          <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700/50 glass-panel shadow-lg transition-colors duration-300">
            <div className="flex flex-col items-center mb-8">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <div
                className={`relative group cursor-pointer mb-6 ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                onClick={() => fileInputRef.current?.click()}
              >
                <img
                  src={authUser?.profilePic || "/logo.png"}
                  alt="profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-xl group-hover:border-blue-500 transition-colors"
                />
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">
                    {isUpdating ? "Uploading..." : "Change Avatar"}
                  </span>
                </div>
              </div>

              {/* Editable Name */}
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                    />
                    <button
                      onClick={handleNameSave}
                      className="text-blue-500 text-sm font-semibold hover:text-blue-400"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="text-slate-500 text-sm hover:text-slate-400"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50 transition-colors duration-300">
                      {authUser?.fullName}
                    </h2>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-slate-400 hover:text-blue-500 transition-colors"
                      title="Edit Name"
                    >
                      ✏️
                    </button>
                  </div>
                )}
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                {authUser?.email}
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700/50 pt-6 transition-colors duration-300">
              <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">
                Account Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Member since
                  </span>
                  <span className="text-slate-900 dark:text-slate-50">
                    {new Date(authUser?.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">
                    Status
                  </span>
                  <span className="text-green-600 dark:text-green-500 font-medium">
                    Online
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
