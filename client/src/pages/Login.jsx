import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAuthUser } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Send the request to our backend API
      const response = await axios.post(
        "http://localhost:4500/api/auth/login",
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
    <div className="flex justify-center items-center h-screen w-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Wave Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 bg-linear-to-b from-blue-500 to-transparent pointer-events-none" />

      <div className="w-96 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-2xl z-10 transition-colors duration-300">
        <h1 className="text-4xl font-extrabold mb-2 text-blue-600 dark:text-blue-500 text-center tracking-tight">
          RWave
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-center mb-8 font-medium">
          Login to your account
        </p>

        {/* We changed the div to a <form> so hitting "Enter" works automatically */}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
            />
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 transform transition-all duration-200 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30"
          >
            Login
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
