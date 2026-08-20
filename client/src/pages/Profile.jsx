import { useState, useRef } from "react";
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
          `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/auth/profile`,
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
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-base-200 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-linear-to-b from-primary to-transparent pointer-events-none" />

      {/* Navbar */}
      <div className="w-full h-16 border-b border-base-300 flex shrink-0 items-center px-6 bg-base-100/60 backdrop-blur-xl z-50 shadow-sm transition-colors duration-300">
        <Link
          to="/chat"
          className="group flex items-center gap-2 px-4 py-2 rounded-xl text-base-content/80 hover:text-primary hover:bg-base-200 transition-all duration-300 font-medium"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
          <span>Back to Chat</span>
        </Link>
        <h1 className="ml-8 text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-base-content to-base-content/50 transition-colors duration-300">
          Your Profile
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto pt-6 pb-6 px-4 sm:px-8 flex justify-center z-10">
        <div className="w-full max-w-2xl">
          <div className="bg-base-100 p-8 rounded-3xl border border-base-300 shadow-xl transition-colors duration-300">
            
            {/* Header: Avatar & Quick Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 border-b border-base-200 pb-6">
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
                    className="w-24 h-24 rounded-full object-cover border-4 border-base-200 shadow-lg group-hover:border-primary transition-colors"
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
                  <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                    {authUser?.fullName}
                  </h2>
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="hidden sm:block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      Edit Profile
                    </button>
                  )}
                </div>
                <p className="text-base-content/70 font-medium">
                  {authUser?.username ? `@${authUser.username}` : authUser?.email}
                </p>
                
                {authUser?.bio && (
                  <p className="mt-4 text-base-content/90 text-sm bg-base-200 p-3 rounded-lg border border-base-300">
                    "{authUser.bio}"
                  </p>
                )}
                
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="sm:hidden mt-4 px-6 py-2 bg-primary/10 text-primary font-semibold rounded-full hover:bg-primary/20 transition-colors w-full"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form / View */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-base-content/90 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-base-200 border border-base-300 focus:ring-2 focus:ring-primary focus:border-primary text-base-content transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-base-content/90 mb-1">Username</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-base-content/50 font-bold">@</span>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="your_handle"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-base-200 border border-base-300 focus:ring-2 focus:ring-primary focus:border-primary text-base-content transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-base-content/90 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    maxLength="150"
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 rounded-xl bg-base-200 border border-base-300 focus:ring-2 focus:ring-primary focus:border-primary text-base-content transition-all min-h-15 resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-base-content/90 mb-1">Phone Number</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 rounded-xl bg-base-200 border border-base-300 focus:ring-2 focus:ring-primary focus:border-primary text-base-content transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-base-content/90 mb-1">Status Message</label>
                    <select
                      name="statusMessage"
                      value={formData.statusMessage}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl bg-base-200 border border-base-300 focus:ring-2 focus:ring-primary focus:border-primary text-base-content transition-all"
                    >
                      <option value="Available">🟢 Available</option>
                      <option value="Busy">🔴 Busy</option>
                      <option value="Away">🟡 Away</option>
                      <option value="Offline">⚫ Offline</option>
                    </select>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="pt-2 border-t border-base-200">
                  <h3 className="text-sm font-bold text-base-content mb-2">Privacy Settings</h3>
                  <div className="space-y-2">
                    <label className="flex items-center justify-between p-3 bg-base-200 rounded-xl border border-base-300 cursor-pointer">
                      <div>
                        <div className="font-semibold text-base-content">Show Phone Number</div>
                        <div className="text-xs text-base-content/70">Allow other users to see your phone number</div>
                      </div>
                      <input
                        type="checkbox"
                        name="showPhoneNumber"
                        checked={formData.showPhoneNumber}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-base-200 rounded-xl border border-base-300 cursor-pointer">
                      <div>
                        <div className="font-semibold text-base-content">Show Last Seen & Status</div>
                        <div className="text-xs text-base-content/70">Let others see when you were last active</div>
                      </div>
                      <input
                        type="checkbox"
                        name="showLastSeen"
                        checked={formData.showLastSeen}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isUpdating}
                    className="flex-1 py-2 bg-primary hover:bg-secondary text-primary-content font-bold rounded-xl shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={isUpdating}
                    className="px-6 py-2 bg-base-200 hover:bg-base-300 text-base-content font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-5 bg-base-200 rounded-2xl border border-base-300">
                    <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">Phone Number</p>
                    <p className="text-base-content font-medium">
                      {authUser?.phoneNumber || "Not set"}
                    </p>
                  </div>
                  <div className="p-5 bg-base-200 rounded-2xl border border-base-300">
                    <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">Current Status</p>
                    <p className="text-base-content font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        authUser?.statusMessage === "Available" ? "bg-green-500" :
                        authUser?.statusMessage === "Busy" ? "bg-red-500" :
                        authUser?.statusMessage === "Away" ? "bg-yellow-500" : "bg-slate-500"
                      }`}></span>
                      {authUser?.statusMessage || "Available"}
                    </p>
                  </div>
                </div>
                
                <div className="p-5 bg-base-200 rounded-2xl border border-base-300">
                  <p className="text-xs font-bold text-base-content/50 uppercase tracking-wider mb-1">Account Info</p>
                  <div className="space-y-2 mt-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/70">Member since</span>
                      <span className="font-medium text-base-content">{new Date(authUser?.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-base-content/70">Email Address</span>
                      <span className="font-medium text-base-content">{authUser?.email}</span>
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
