import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-slate-100 dark:bg-slate-950 transition-colors duration-300 overflow-hidden relative">
      {/* Professional subtle decorative background top bar */}
      <div className="absolute top-0 left-0 w-full h-[30vh] bg-blue-600 dark:bg-slate-900 shadow-sm transition-colors duration-300 z-0"></div>
      
      {/* Elevated Native-like App Container */}
      <div className="flex w-full max-w-[1600px] h-[95vh] sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900 z-10 mx-0 sm:mx-6 transition-all duration-300">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default Home;
