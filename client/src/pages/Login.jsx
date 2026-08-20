import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send the request to our backend API
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:4500"}/api/auth/login`,
        { email, password },
        {
          withCredentials: true, // Extremely important: tells Axios to save the JWT cookie!
        },
      );

      // Update global context so React Router instantly redirects to Home
      setAuthUser(response.data);
      toast.success("Login successful!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-base-200 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Wave Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-linear-to-b from-primary to-transparent pointer-events-none" />

      <motion.div 
        className="w-96 p-8 rounded-2xl bg-base-100 border border-base-300 shadow-2xl z-10 transition-colors duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold mb-2 text-primary text-center tracking-tight">
          RWave
        </h1>
        <p className="text-base-content/70 text-center mb-8 font-medium">
          Login to your account
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <motion.input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input w-full px-4 py-3 rounded-xl bg-base-200 border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all text-base-content placeholder:text-base-content/50"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input w-full pl-10 pr-4 py-3.5 bg-base-200 border border-base-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-base-content transition-all placeholder:text-base-content/50"
            />
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-primary hover:text-secondary font-semibold transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </motion.div>
          <motion.button
            type="submit"
            className="btn btn-primary btn-gradient w-full py-3.5 px-4 text-primary-content font-bold rounded-xl shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Login
          </motion.button>
        </form>

        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-base-content/80 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-primary hover:text-secondary font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
