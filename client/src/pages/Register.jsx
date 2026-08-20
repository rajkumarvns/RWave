import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

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
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/auth/register`,
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
    <div className="flex justify-center items-center h-screen w-full bg-base-200 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-linear-to-b from-primary to-transparent pointer-events-none" />

      <motion.div 
        className="w-96 p-8 rounded-2xl bg-base-100 border border-base-300 shadow-2xl z-10 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold mb-2 text-primary text-center tracking-tight">
          RWave
        </h1>
        <p className="text-base-content/70 text-center mb-6 font-medium">
          Create your account
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <motion.div 
            className="flex flex-col items-center mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <label
              htmlFor="avatar-upload"
              className="relative cursor-pointer group"
            >
              <img
                src={profilePic || "/logo.png"}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-base-300 group-hover:border-primary transition-colors"
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
          </motion.div>

          <motion.input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="input w-full px-4 py-3 rounded-xl bg-base-200 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base-content placeholder:text-base-content/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input w-full px-4 py-3 rounded-xl bg-base-200 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base-content placeholder:text-base-content/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          <motion.input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input w-full px-4 py-3 rounded-xl bg-base-200 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base-content placeholder:text-base-content/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          />
          <motion.button
            type="submit"
            disabled={isRegistering}
            className="btn btn-primary btn-gradient w-full py-3.5 mt-2 text-primary-content font-bold rounded-xl shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed disabled:transform-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {isRegistering ? "Creating..." : "Sign Up"}
          </motion.button>
        </form>

        <motion.div 
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <p className="text-base-content/80 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:text-secondary font-bold hover:underline"
            >
              Log in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
