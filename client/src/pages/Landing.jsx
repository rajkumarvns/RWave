import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const Landing = () => {
  const { authUser } = useAuth();

  // If already logged in, skip landing page
  if (authUser) return <Navigate to="/chat" />;

  return (
    <div className="flex flex-col min-h-screen bg-base-200 relative overflow-hidden font-sans transition-colors duration-500">
      {/* Decorative Wave Background */}
      <div 
        className="absolute top-0 left-0 w-full h-[220px] z-0 transition-colors duration-500 bg-primary/20" 
      />

      {/* Main Container */}
      <div className="z-10 flex flex-col flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 mt-10 relative">
        
        {/* Navbar */}
        <nav className="flex items-center justify-between py-4 mb-8 bg-base-100 rounded-2xl shadow-sm px-6 transition-colors duration-500">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-primary-content shadow-md transition-colors duration-500 bg-primary"
            >
              RW
            </div>
            <span className="text-xl font-bold text-base-content tracking-wide">
              RWave
            </span>
          </div>
          <div className="flex items-center gap-4">
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Link
                to="/login"
                className="font-medium text-base-content/80 transition-colors px-4 py-2"
              >
                Login
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              <Link
                to="/register"
                className="btn btn-primary btn-gradient text-primary-content border-none rounded-full px-6 shadow-sm"
              >
                Get Started
              </Link>
            </motion.div>
          </div>
        </nav>

        {/* Hero Section */}
        <motion.main 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex-1 flex flex-col md:flex-row items-center justify-between gap-12 bg-base-100 rounded-3xl p-8 md:p-12 shadow-lg transition-colors duration-500"
        >
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-base-content mb-6 leading-tight">
              Message privately, <br />
              <span className="font-bold transition-colors duration-500 text-primary">
                seamlessly connected.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-base-content/70 max-w-xl mb-10">
              Simple, reliable, private messaging and calling for free, available all over the world.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center">
              <Link
                to="/login"
                className="btn btn-primary btn-gradient rounded-full px-8 py-3 text-lg font-medium h-auto shadow-lg shadow-primary/30"
              >
                Open RWave Web
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md relative">
            {/* Abstract Graphic representing Chat/Mobile */}
            <div className="relative w-full aspect-[4/5] bg-base-200 rounded-[2rem] border-[8px] border-base-300 shadow-2xl overflow-hidden flex flex-col transition-colors duration-500">
              <div 
                className="h-16 w-full flex items-center px-4 gap-3 shrink-0 transition-colors duration-500 bg-primary"
              >
                <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-white/40 rounded-full"></div>
                  <div className="h-2 w-16 bg-white/20 rounded-full"></div>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-4 bg-base-200 transition-colors duration-500">
                <div className="max-w-[70%] bg-base-100 p-3 rounded-tr-xl rounded-b-xl shadow-sm text-sm text-base-content transition-colors duration-500">
                  Hey! How are you doing? 👋
                </div>
                <div 
                  className="max-w-[70%] p-3 rounded-tl-xl rounded-b-xl shadow-sm ml-auto text-sm text-primary-content transition-colors duration-500 bg-primary"
                >
                  I'm good! Have you seen the new RWave design? It's amazing.
                </div>
                <div className="max-w-[70%] bg-base-100 p-3 rounded-tr-xl rounded-b-xl shadow-sm text-sm text-base-content transition-colors duration-500">
                  Yeah, loving it!
                </div>
              </div>
              <div className="h-16 bg-base-300 w-full flex items-center px-4 gap-2 shrink-0 transition-colors duration-500">
                <div className="w-8 h-8 rounded-full bg-base-content/20"></div>
                <div className="flex-1 h-10 bg-base-100 rounded-full"></div>
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 bg-primary"
                >
                  <span className="text-primary-content text-xs">▶</span>
                </div>
              </div>
            </div>
          </div>
        </motion.main>
      </div>

      <motion.footer
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="py-8 text-center text-base-content/70 text-sm z-10 mt-auto bg-base-200 transition-colors duration-500"
      >
        &copy; {new Date().getFullYear()} RWave. All rights reserved.
      </motion.footer>
    </div>
  );
};

export default Landing;
