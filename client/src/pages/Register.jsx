import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Register = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const { setAuthUser } = useAuth();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setIsRegistering(true);
      const response = await axios.post(
        "http://localhost:4500/api/auth/register",
        { fullName, email, password, profilePic },
        {
          withCredentials: true,
        },
      );
      setAuthUser(response.data);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 bg-linear-to-b from-blue-500 to-transparent pointer-events-none" />

      <div className="w-96 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-2xl z-10 transition-colors duration-300">
        <h1 className="text-4xl font-extrabold mb-2 text-blue-600 dark:text-blue-500 text-center tracking-tight">
          RWave
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-6 font-medium">
          Create your account
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex flex-col items-center mb-4">
            <label
              htmlFor="avatar-upload"
              className="relative cursor-pointer group"
            >
              <img
                src={profilePic || "/logo.png"}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-700 group-hover:border-blue-500 transition-colors"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">Upload</span>
              </div>
            </label>
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 transform transition-all duration-200 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isRegistering ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
