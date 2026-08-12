import React, { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const themes = {
  whatsapp: {
    name: "WhatsApp",
    primary: "#00a884",
    secondary: "#25D366",
    hover: "#128C7E",
  },
  spotify: {
    name: "Spotify",
    primary: "#1DB954",
    secondary: "#1ED760",
    hover: "#1aa34a",
  },
  discord: {
    name: "Discord",
    primary: "#5865F2",
    secondary: "#7289DA",
    hover: "#4752C4",
  },
  twitter: {
    name: "Twitter",
    primary: "#1D9BF0",
    secondary: "#1A8CD8",
    hover: "#1A8CD8",
  },
  youtube: {
    name: "YouTube",
    primary: "#FF0000",
    secondary: "#FF0000",
    hover: "#CC0000",
  },
  github: {
    name: "GitHub",
    primary: "#24292e",
    secondary: "#24292e",
    hover: "#1b1f23",
  },
};

const Landing = () => {
  const { authUser } = useAuth();
  const [activeTheme, setActiveTheme] = useState("whatsapp");
  
  const theme = themes[activeTheme];

  // If already logged in, skip landing page
  if (authUser) return <Navigate to="/chat" />;

  return (
    <div className="flex flex-col min-h-screen bg-[#EFEAE2] dark:bg-[#111B21] relative overflow-hidden font-sans transition-colors duration-500">
      {/* Decorative Wave Background */}
      <div 
        className="absolute top-0 left-0 w-full h-[220px] z-0 transition-colors duration-500" 
        style={{ backgroundColor: theme.primary }} 
      />

      {/* Main Container */}
      <div className="z-10 flex flex-col flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 mt-10 relative">
        
        {/* Navbar */}
        <nav className="flex items-center justify-between py-4 mb-8 bg-white dark:bg-[#202c33] rounded-2xl shadow-sm px-6 transition-colors duration-500">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md transition-colors duration-500"
              style={{ backgroundColor: theme.secondary }}
            >
              RW
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wide">
              RWave
            </span>
          </div>
          <div className="flex items-center gap-4">
            
            {/* Theme Dropdown in Navbar */}
            <details className="dropdown dropdown-end" id="theme-dropdown">
              <summary className="btn btn-ghost btn-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                Theme <span className="opacity-50 text-xs">▼</span>
              </summary>
              <ul className="dropdown-content menu bg-base-100 dark:bg-slate-800 rounded-box z-[1] w-40 p-2 shadow mt-2">
                {Object.keys(themes).map((themeKey) => (
                  <li key={themeKey}>
                    <a 
                      onClick={() => {
                        setActiveTheme(themeKey);
                        const dropdown = document.getElementById("theme-dropdown");
                        if (dropdown) dropdown.removeAttribute("open");
                      }} 
                      className={activeTheme === themeKey ? "bg-slate-200 dark:bg-slate-700 font-bold" : ""}
                    >
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: themes[themeKey].primary }}></div>
                      {themes[themeKey].name}
                    </a>
                  </li>
                ))}
              </ul>
            </details>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Link
                to="/login"
                className="font-medium text-slate-600 dark:text-slate-300 transition-colors px-4 py-2"
              >
                Login
              </Link>
            </motion.div>
            
            <Link
              to="/register"
              className="btn text-white border-none rounded-full px-6 shadow-sm transition-colors duration-500"
              style={{ backgroundColor: theme.secondary }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = theme.hover)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = theme.secondary)}
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col md:flex-row items-center justify-between gap-12 bg-white dark:bg-[#202c33] rounded-3xl p-8 md:p-12 shadow-lg transition-colors duration-500">
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-slate-800 dark:text-slate-100 mb-6 leading-tight">
              Message privately, <br />
              <span className="font-bold transition-colors duration-500" style={{ color: theme.primary }}>
                seamlessly connected.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-xl mb-10">
              Simple, reliable, private messaging and calling for free, available all over the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
              <Link
                to="/login"
                className="btn btn-outline border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-full px-8 py-3 text-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 h-auto"
              >
                Open RWave Web
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md relative">
            {/* Abstract Graphic representing Chat/Mobile */}
            <div className="relative w-full aspect-[4/5] bg-slate-100 dark:bg-[#111B21] rounded-[2rem] border-[8px] border-white dark:border-[#2a3942] shadow-2xl overflow-hidden flex flex-col transition-colors duration-500">
              <div 
                className="h-16 w-full flex items-center px-4 gap-3 shrink-0 transition-colors duration-500"
                style={{ backgroundColor: theme.primary }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-white/40 rounded-full"></div>
                  <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 bg-[#EFEAE2] dark:bg-[#0b141a] transition-colors duration-500">
                <div className="max-w-[70%] bg-white dark:bg-[#202c33] p-3 rounded-tr-xl rounded-b-xl shadow-sm text-sm dark:text-slate-200 transition-colors duration-500">
                  Hey! How are you doing? 👋
                </div>
                <div 
                  className="max-w-[70%] p-3 rounded-tl-xl rounded-b-xl shadow-sm ml-auto text-sm text-white transition-colors duration-500"
                  style={{ backgroundColor: theme.primary }}
                >
                  I'm good! Have you seen the new RWave design? It's amazing.
                </div>
                <div className="max-w-[70%] bg-white dark:bg-[#202c33] p-3 rounded-tr-xl rounded-b-xl shadow-sm text-sm dark:text-slate-200 transition-colors duration-500">
                  Yeah, loving it!
                </div>
              </div>
              <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] w-full flex items-center px-4 gap-2 shrink-0 transition-colors duration-500">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#2a3942]"></div>
                <div className="flex-1 h-10 bg-white dark:bg-[#2a3942] rounded-full"></div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500"
                  style={{ backgroundColor: theme.primary }}
                >
                  <span className="text-white text-xs">▶</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <motion.footer
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm z-10 mt-auto bg-[#EFEAE2] dark:bg-[#111B21] transition-colors duration-500"
      >
        &copy; {new Date().getFullYear()} RWave. All rights reserved.
      </motion.footer>
    </div>
  );
};

export default Landing;
