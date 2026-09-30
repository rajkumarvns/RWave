import React from "react";
import { useCall } from "../context/CallContext";
import { FiPhone, FiVideo, FiMic, FiMicOff, FiVideoOff, FiPhoneOff } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const CallUI = () => {
  const {
    callState,
    callType,
    incomingCallData,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
    audioRef,
  } = useCall();

  if (callState === "idle") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        {callState === "ringing" && incomingCallData && (
          <div className="bg-[#202c33] p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 border border-gray-700">
            <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center animate-pulse">
              {incomingCallData.callType === "video" ? (
                <FiVideo size={40} className="text-white" />
              ) : (
                <FiPhone size={40} className="text-white" />
              )}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-white">Incoming Call</h2>
              <p className="text-gray-400 mt-2">
                {incomingCallData.callType === "video" ? "Video" : "Audio"} call...
              </p>
            </div>
            <div className="flex gap-6 mt-4">
              <button
                onClick={rejectCall}
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              >
                <FiPhoneOff size={24} className="text-white" />
              </button>
              <button
                onClick={acceptCall}
                className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-lg"
              >
                {incomingCallData.callType === "video" ? (
                  <FiVideo size={24} className="text-white" />
                ) : (
                  <FiPhone size={24} className="text-white" />
                )}
              </button>
            </div>
          </div>
        )}

        {callState === "calling" && (
          <div className="text-white flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
              {callType === "video" ? <FiVideo size={40} /> : <FiPhone size={40} />}
            </div>
            <h2 className="text-2xl font-semibold">Calling...</h2>
            <button
              onClick={() => endCall(true)}
              className="mt-8 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
            >
              <FiPhoneOff size={24} className="text-white" />
            </button>
          </div>
        )}

        {callState === "active" && (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#111b21]">
            {callType === "video" ? (
              <div className="w-full h-full relative">
                {/* Remote Video (Full Screen) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                
                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-8 right-8 w-48 h-64 bg-black rounded-lg overflow-hidden border-2 border-gray-600 shadow-2xl z-10">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-8">
                <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-[#00a884]/20">
                  <FiPhone size={48} className="text-[#00a884]" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Audio Call Active</h2>
                <audio ref={audioRef} autoPlay />
              </div>
            )}

            {/* Controls */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-[#202c33]/80 backdrop-blur-md px-8 py-4 rounded-full border border-gray-700/50">
              <button
                onClick={toggleMute}
                className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <FiMic size={22} className="text-white" />
              </button>
              
              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
                >
                  <FiVideo size={22} className="text-white" />
                </button>
              )}
              
              <button
                onClick={() => endCall(true)}
                className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              >
                <FiPhoneOff size={24} className="text-white" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CallUI;
