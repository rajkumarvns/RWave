import React from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  return (
    <div className="w-full flex-1 h-full min-h-0 bg-base-200 transition-colors duration-300 overflow-hidden relative flex flex-col p-0 lg:p-3 xl:p-4 justify-center">
      {/* Elevated Native-like App Container */}
      <div className="drawer lg:drawer-open w-full max-w-[1600px] mx-auto h-full rounded-none lg:rounded-2xl overflow-hidden shadow-none lg:shadow-xl border-0 lg:border border-base-300 bg-base-100 z-10 transition-all duration-300 min-h-0">
        <input id="mobile-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        
        <div className="drawer-content flex flex-col h-full w-full min-h-0 overflow-hidden">
          <ChatWindow />
        </div> 

        <div className="drawer-side z-[100] h-full">
          <label htmlFor="mobile-sidebar-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="h-full w-[85vw] max-w-[360px] sm:max-w-[400px] lg:w-[400px] bg-white dark:bg-[#111b21] flex flex-col min-h-0 overflow-hidden">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
