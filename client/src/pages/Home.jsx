import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  return (
    <div className="flex justify-center items-center flex-1 bg-base-200 transition-colors duration-300 overflow-hidden relative">
      {/* Elevated Native-like App Container */}
      <div className="flex w-full max-w-[1600px] h-[calc(100vh-8rem)] sm:rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-base-300 bg-base-100 z-10 mx-0 sm:mx-6 transition-all duration-300">
        <Sidebar />
        <ChatWindow />
      </div>
    </div>
  );
};

export default Home;
