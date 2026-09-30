import React from "react";
import { useCall } from "../context/CallContext";
import {
  FiPhone,
  FiVideo,
  FiMic,
  FiMicOff,
  FiVideoOff,
  FiPhoneOff,
  FiUser,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const formatDuration = (totalSeconds) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${pad(hrs)}:${pad(remMins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
};

const CallUI = () => {
  const {
    callState,
    callType,
    incomingCallData,
    callPartner,
    callDuration,
    isMuted,
    isVideoOff,
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

  const partnerName = callPartner?.fullName || "Contact";
  const partnerAvatar = callPartner?.profilePic || "/logo.png";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md select-none"
      >
        {/* INCOMING CALL SCREEN */}
        {callState === "ringing" && incomingCallData && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-[#1f2c34] p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-gray-700/60 max-w-sm w-[90%]"
          >
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#00a884] shadow-xl">
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#00a884] flex items-center justify-center text-white shadow-md">
                {callType === "video" ? <FiVideo size={18} /> : <FiPhone size={18} />}
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {partnerName}
              </h2>
              <p className="text-sm font-medium text-[#00a884] mt-1.5 animate-pulse">
                Incoming {callType === "video" ? "Video" : "Audio"} Call...
              </p>
            </div>

            <div className="flex items-center gap-8 mt-4">
              <button
                onClick={rejectCall}
                className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg shadow-red-600/30"
                title="Decline"
              >
                <FiPhoneOff size={24} />
              </button>
              <button
                onClick={acceptCall}
                className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/30 animate-bounce"
                title="Accept"
              >
                {callType === "video" ? <FiVideo size={24} /> : <FiPhone size={24} />}
              </button>
            </div>
          </motion.div>
        )}

        {/* OUTGOING CALL SCREEN */}
        {callState === "calling" && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col items-center gap-6 text-center max-w-sm w-[90%]"
          >
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-600 shadow-2xl animate-pulse">
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-md">
                {callType === "video" ? <FiVideo size={18} /> : <FiPhone size={18} />}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {partnerName}
              </h2>
              <p className="text-sm font-medium text-gray-400 mt-1.5 animate-pulse">
                Calling {callType === "video" ? "Video" : "Audio"}...
              </p>
            </div>

            <button
              onClick={() => endCall(true)}
              className="mt-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-xl shadow-red-600/40"
              title="Cancel Call"
            >
              <FiPhoneOff size={24} />
            </button>
          </motion.div>
        )}

        {/* ACTIVE CALL SCREEN */}
        {callState === "active" && (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-[#0b141a]">
            {/* Header info badge */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white shadow-lg">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white/20">
                <img
                  src={partnerAvatar}
                  alt={partnerName}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-semibold">{partnerName}</span>
              <span className="text-xs bg-[#00a884]/20 text-[#00a884] font-mono px-2 py-0.5 rounded-full border border-[#00a884]/40">
                {formatDuration(callDuration)}
              </span>
            </div>

            {callType === "video" ? (
              <div className="w-full h-full relative overflow-hidden">
                {/* Remote Video (Full Screen) */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover bg-black"
                />

                {/* Local Video (Picture-in-Picture) */}
                <div className="absolute top-6 right-6 w-36 h-48 sm:w-48 sm:h-64 bg-[#1f2c34] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
                  {!isVideoOff ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-900 text-gray-400">
                      <FiVideoOff size={28} />
                      <span className="text-xs">Camera Off</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Audio Call Centerpiece */
              <div className="flex flex-col items-center justify-center gap-6">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#00a884]/80 shadow-2xl shadow-[#00a884]/30 animate-pulse">
                  <img
                    src={partnerAvatar}
                    alt={partnerName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white tracking-wide">
                    {partnerName}
                  </h2>
                  <p className="text-sm font-mono text-[#00a884] mt-1 font-semibold">
                    {formatDuration(callDuration)}
                  </p>
                </div>
                <audio ref={audioRef} autoPlay />
              </div>
            )}

            {/* Controls Bar */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-5 bg-[#1f2c34]/90 backdrop-blur-lg px-6 py-3 rounded-full border border-gray-700/60 shadow-2xl">
              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                  isMuted
                    ? "bg-red-500/90 text-white hover:bg-red-600 shadow-md shadow-red-500/30"
                    : "bg-gray-700/80 text-white hover:bg-gray-600"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
              </button>

              {/* Video Button */}
              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-105 ${
                    isVideoOff
                      ? "bg-red-500/90 text-white hover:bg-red-600 shadow-md shadow-red-500/30"
                      : "bg-gray-700/80 text-white hover:bg-gray-600"
                  }`}
                  title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                >
                  {isVideoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                </button>
              )}

              {/* End Call Button */}
              <button
                onClick={() => endCall(true)}
                className="w-13 h-13 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-lg shadow-red-600/40"
                title="End Call"
              >
                <FiPhoneOff size={22} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CallUI;
