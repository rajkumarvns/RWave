import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const Profile = () => {
  const { authUser, setAuthUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    username: authUser?.username || "",
    bio: authUser?.bio || "",
    phoneNumber: authUser?.phoneNumber || "",
    statusMessage: authUser?.statusMessage || "Available",
    showPhoneNumber: authUser?.privacySettings?.showPhoneNumber ?? false,
    showLastSeen: authUser?.privacySettings?.showLastSeen ?? true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

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
          { withCredentials: true }
        );
        setAuthUser(response.data);
        toast.success("Profile picture updated!");
      } catch (error) {
        toast.error("Error updating profile picture");
      } finally {
        setIsUpdating(false);
      }
    };
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      
      const payload = {
        fullName: formData.fullName,
        username: formData.username,
        bio: formData.bio,
        phoneNumber: formData.phoneNumber,
        statusMessage: formData.statusMessage,
        privacySettings: {
          showPhoneNumber: formData.showPhoneNumber,
          showLastSeen: formData.showLastSeen,
        }
      };

      const response = await axios.put(
        "http://localhost:4500/api/auth/profile",
        payload,
        { withCredentials: true }
      );
      setAuthUser(response.data);
      toast.success("Profile saved successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error saving profile");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
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
        <h1 className="ml-8 text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-slate-800 to-slate-500 dark:from-slate-50 dark:to-slate-300 transition-colors duration-300">
          Your Profile
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pt-24 pb-8 px-8 flex justify-center z-10">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-xl transition-colors duration-300">
            
            {/* Header: Avatar & Quick Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8 border-b border-slate-100 dark:border-slate-700/50 pb-8">
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
                <div
                  className={`relative group cursor-pointer ${isUpdating ? "opacity-50 pointer-events-none" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    src={authUser?.profilePic || "/logo.png"}
                    alt="profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-slate-100 dark:border-slate-700 shadow-lg group-hover:border-blue-500 transition-colors"
                  />
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm font-medium">
                      {isUpdating ? "Uploading..." : "Change Avatar"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left mt-2">
                <div className="flex items-center justify-center sm:justify-between mb-2">
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {authUser?.fullName}
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="hidden sm:block px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {authUser?.username ? `@${authUser.username}` : authUser?.email}
                </p>
                
                {authUser?.bio && (
                  <p className="mt-4 text-slate-700 dark:text-slate-300 text-sm bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{authUser.bio}"
                  </p>
                )}
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="sm:hidden mt-4 px-6 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors w-full"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form / View */}
            {isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-400 font-bold">@</span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="your_handle"
                        className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength="150"
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all min-h-[100px] resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Status Message</label>
                    <select
                      name="statusMessage"
                      value={formData.statusMessage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-white transition-all"
                    >
                      <option value="Available">🟢 Available</option>
                      <option value="Busy">🔴 Busy</option>
                      <option value="Away">🟡 Away</option>
                      <option value="Offline">⚫ Offline</option>
                    </select>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Privacy Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Show Phone Number</div>
                        <div className="text-xs text-slate-500">Allow other users to see your phone number</div>
                      </div>
                      <input
                        type="checkbox"
                        name="showPhoneNumber"
                        checked={formData.showPhoneNumber}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">Show Last Seen & Status</div>
                        <div className="text-xs text-slate-500">Let others see when you were last active</div>
                      </div>
                      <input
                        type="checkbox"
                        name="showLastSeen"
                        checked={formData.showLastSeen}
                        onChange={handleChange}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdating}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {authUser?.phoneNumber || "Not set"}
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current Status</p>
                    <p className="text-slate-800 dark:text-slate-200 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        authUser?.statusMessage === "Available" ? "bg-green-500" :
                        authUser?.statusMessage === "Busy" ? "bg-red-500" :
                        authUser?.statusMessage === "Away" ? "bg-yellow-500" : "bg-slate-500"
                      }`}></span>
                      {authUser?.statusMessage || "Available"}
                    </p>
                  </div>
                </div>
                
                <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Info</p>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Member since</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(authUser?.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Email Address</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{authUser?.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

