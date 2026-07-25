import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await axios.post("http://localhost:4500/api/auth/forgot-password", {
        email,
      });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    try {
      await axios.post("http://localhost:4500/api/auth/verify-otp", {
        email,
        otp,
      });
      toast.success("OTP verified!");
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.error || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return;
    setIsLoading(true);
    try {
      await axios.post("http://localhost:4500/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-full bg-slate-50 dark:bg-slate-900 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 bg-linear-to-b from-blue-500 to-transparent pointer-events-none" />

      <div className="w-96 p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 shadow-2xl z-10 transition-colors duration-300">
        <h1 className="text-3xl font-extrabold mb-2 text-slate-900 dark:text-white text-center tracking-tight">
          Reset Password
        </h1>

        {step === 1 && (
          <>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 font-medium text-sm">
              Enter your email to receive a 6-digit OTP
            </p>
            <form onSubmit={handleSendOtp} className="space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 transform transition-all duration-200 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 font-medium text-sm">
              Enter the 6-digit OTP sent to {email}
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder="6-Digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full text-center tracking-widest text-2xl font-bold px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-3.5 mt-2 bg-blue-600 hover:bg-blue-500 hover:-translate-y-0.5 transform transition-all duration-200 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-8 font-medium text-sm">
              Create a new password
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input
                type="password"
                placeholder="New Password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button
                disabled={isLoading}
                type="submit"
                className="w-full py-3.5 mt-2 bg-green-600 hover:bg-green-500 hover:-translate-y-0.5 transform transition-all duration-200 rounded-xl font-bold text-white shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-slate-500 dark:text-slate-400 text-sm font-medium hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
