import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { authUser } = useAuth();

  // If already logged in, skip landing page
  if (authUser) return <Navigate to="/chat" />;

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Decorative Wave Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-linear-to-br from-blue-500 via-indigo-500 to-transparent pointer-events-none" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full h-20 border-b border-slate-700/50 flex items-center justify-between px-8 bg-slate-900/40 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 group-hover:shadow-blue-500/50 transition-all duration-300">
            RW
          </div>
          <span className="text-xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-slate-50 to-slate-300 tracking-wide group-hover:text-white transition-colors duration-300">
            RWave
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-slate-300 hover:text-white transition-colors font-medium relative after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-blue-400 after:transition-all after:duration-300 hover:after:w-full"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 font-semibold transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300 mb-6">
          Real-Time Conversations,
          <br />
          Seamlessly Connected.
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10">
          A minimalist, professional chat application designed for speed and
          clarity. Experience instant messaging with beautiful glassmorphism
          design.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/register"
            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-xl shadow-blue-500/20 font-semibold text-lg flex items-center justify-center gap-2"
          >
            Start Chatting Now <span className="text-xl">→</span>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto w-full">
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 glass-panel text-left">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-slate-50 mb-2">
              Instant Messaging
            </h3>
            <p className="text-slate-400">
              Powered by WebSockets for zero-latency real-time communication.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 glass-panel text-left">
            <div className="text-3xl mb-4">🖼️</div>
            <h3 className="text-xl font-bold text-slate-50 mb-2">
              Image Sharing
            </h3>
            <p className="text-slate-400">
              Seamlessly share high-quality images directly in your
              conversations.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 glass-panel text-left">
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-slate-50 mb-2">
              Beautiful UX
            </h3>
            <p className="text-slate-400">
              A stunning Discord/WhatsApp hybrid design with Dark Mode built-in.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-slate-500 text-sm z-10 border-t border-slate-800">
        &copy; {new Date().getFullYear()} RWave. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
