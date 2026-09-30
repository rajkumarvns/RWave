import React from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FiMessageSquare, FiShield, FiSmartphone, FiVideo } from "react-icons/fi";

const Landing = () => {
  const { authUser } = useAuth();

  if (authUser) return <Navigate to="/chat" />;

  const features = [
    { icon: <FiMessageSquare size={24} />, title: "Instant Messaging", desc: "Fast, reliable, and secure messaging anywhere." },
    { icon: <FiShield size={24} />, title: "End-to-End Privacy", desc: "Your personal messages are secure and private." },
    { icon: <FiVideo size={24} />, title: "Voice & Video", desc: "High quality calls with friends and family." },
    { icon: <FiSmartphone size={24} />, title: "Cross Platform", desc: "Seamlessly syncs across all your devices." },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f0f2f5] dark:bg-[#111b21] flex flex-col transition-colors duration-500 overflow-hidden relative font-sans">
      
      {/* WhatsApp-like Green Background Header Accent */}
      <div className="absolute top-0 w-full h-[250px] bg-[#00a884] dark:bg-[#005c4b] z-0 hidden md:block"></div>

      <div className="z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12 relative">
        
        {/* Main Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white dark:bg-[#202c33] rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden min-h-[600px] border border-gray-100 dark:border-gray-800"
        >
          {/* Left Side: Copy & CTA */}
          <div className="flex-1 p-10 lg:p-16 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e7f7f3] dark:bg-[#005c4b]/30 text-[#00a884] dark:text-[#25d366] text-sm font-semibold mb-6">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00a884] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00a884]"></span>
                </span>
                Now available on Web
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 dark:text-gray-100 mb-6 leading-[1.1]">
                Message privately, <br />
                <span className="font-bold text-[#00a884] dark:text-[#25d366]">
                  connect globally.
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mb-10 leading-relaxed">
                RWave brings you a premium, WhatsApp-inspired messaging experience. Simple, reliable, and private chatting for you and your friends.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-[#00a884] hover:bg-[#019071] text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-[#00a884]/40 transform hover:-translate-y-1"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-semibold text-lg transition-all"
                >
                  Log in to Web
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Side: Visual/Mockup */}
          <div className="flex-1 bg-[#f0f2f5] dark:bg-[#0b141a] p-10 lg:p-16 relative overflow-hidden flex items-center justify-center">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40 dark:opacity-10 pointer-events-none" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yO/r/fsWUqRoOsPu.png')", backgroundRepeat: "repeat" }}></div>
            
            {/* Chat Mockup */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
              className="relative w-full max-w-md bg-white dark:bg-[#202c33] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-10 overflow-hidden h-[450px]"
            >
              {/* Mockup Header */}
              <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-3 w-24 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                  <div className="h-2 w-16 bg-[#00a884]/50 rounded"></div>
                </div>
              </div>
              
              {/* Mockup Body */}
              <div className="flex-1 p-4 space-y-4 bg-[#efeae2] dark:bg-[#0b141a] relative">
                <div className="absolute inset-0 opacity-30 dark:opacity-5 pointer-events-none" style={{ backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yO/r/fsWUqRoOsPu.png')" }}></div>
                
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }} className="relative z-10 w-fit max-w-[80%] bg-white dark:bg-[#202c33] p-3 rounded-xl rounded-tl-sm shadow-sm text-sm text-gray-800 dark:text-gray-200">
                  Hey! Have you tried the new RWave yet?
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="relative z-10 w-fit max-w-[80%] ml-auto bg-[#d9fdd3] dark:bg-[#005c4b] p-3 rounded-xl rounded-tr-sm shadow-sm text-sm text-gray-800 dark:text-gray-100">
                  Yes! The new WhatsApp-like design is incredibly sleek. 🔥
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 }} className="relative z-10 w-fit max-w-[80%] bg-white dark:bg-[#202c33] p-3 rounded-xl rounded-tl-sm shadow-sm text-sm text-gray-800 dark:text-gray-200">
                  I know, right? Perfect for our team chats!
                </motion.div>
              </div>
              
              {/* Mockup Input */}
              <div className="h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center gap-3">
                <div className="flex-1 h-10 bg-white dark:bg-[#2a3942] rounded-lg"></div>
                <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="20" height="20" className="text-white fill-current"><path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a.993.993 0 00-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.06-.87.49-.87 1l.01 4.61c0 .71.73 1.2 1.39.91z"></path></svg>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4"
        >
          {features.map((feat, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl hover:bg-white dark:hover:bg-[#202c33] hover:shadow-xl transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-800">
              <div className="w-14 h-14 rounded-full bg-[#00a884]/10 dark:bg-[#00a884]/20 flex items-center justify-center text-[#00a884] dark:text-[#25d366] mb-4">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{feat.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{feat.desc}</p>
            </div>
          ))}
        </motion.div>

      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-gray-500 text-sm z-10 border-t border-gray-200 dark:border-gray-800 bg-[#f0f2f5] dark:bg-[#111b21]">
        <p>&copy; {new Date().getFullYear()} RWave Web. Inspired by premium chat experiences.</p>
      </footer>
    </div>
  );
};

export default Landing;

