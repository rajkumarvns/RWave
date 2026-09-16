import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  return (
    <div className="flex justify-center items-center w-full h-[calc(100vh-64px)] bg-base-200 transition-colors duration-300 overflow-hidden relative p-0 sm:p-4 md:p-8">
      {/* Elevated Native-like App Container */}
      <div className="drawer lg:drawer-open w-full max-w-[1600px] h-full sm:rounded-2xl overflow-hidden shadow-none sm:shadow-2xl sm:shadow-black/20 border-0 sm:border border-base-300 bg-base-100 z-10 transition-all duration-300">
        <input id="mobile-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        
        <div className="drawer-content flex flex-col h-full w-full min-h-0">
          <ChatWindow />
        </div> 

        <div className="drawer-side z-[100] h-full !overflow-visible">
          <label htmlFor="mobile-sidebar-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="h-full relative">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
