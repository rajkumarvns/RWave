import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useChat } from "./ChatContext";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CallContext = createContext();

export const useCall = () => {
  return useContext(CallContext);
};

// Web Audio API Ringtone & Audio Feedback
class CallSoundEffects {
  constructor() {
    this.audioCtx = null;
    this.timer = null;
  }

  getAudioContext() {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  playCallingTone() {
    this.stop();
    const playPulse = () => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.value = 440;
        osc2.type = "sine";
        osc2.frequency.value = 480;

        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(ctx.currentTime);
        osc2.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 1.2);
        osc2.stop(ctx.currentTime + 1.2);
      } catch (e) {
        console.error("Calling tone error:", e);
      }
    };

    playPulse();
    this.timer = setInterval(playPulse, 3000);
  }

  playIncomingRingtone() {
    this.stop();
    const playChime = () => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.value = freq;

          const startTime = ctx.currentTime + i * 0.18;
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.36);
        });
      } catch (e) {
        console.error("Ringtone error:", e);
      }
    };

    playChime();
    this.timer = setInterval(playChime, 2400);
  }

  playEndCallTone() {
    this.stop();
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      console.error("End tone error:", e);
    }
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

const callSounds = new CallSoundEffects();

// Redundant Google public STUN servers for NAT discovery
const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
};

export const CallContextProvider = ({ children }) => {
  const { socket, onlineUsers } = useChat();
  const { authUser } = useAuth();

  const [callState, setCallState] = useState("idle"); // idle, ringing, calling, active
  const [callType, setCallType] = useState("video"); // video, audio
  const [incomingCallData, setIncomingCallData] = useState(null); // { from, signal, callType }
  const [callPartner, setCallPartner] = useState(null); // { _id, fullName, profilePic }
  const [activeUser, setActiveUser] = useState(null); // target user ID string
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
  const candidateQueue = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioRef = useRef(null);

  // Call duration counter when active
  useEffect(() => {
    let interval = null;
    if (callState === "active") {
      setCallDuration(0);
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // Initialize WebRTC Peer Connection
  const initPeerConnection = (otherUserId) => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    candidateQueue.current = [];

    const pc = new RTCPeerConnection(RTC_CONFIG);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          to: otherUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      } else {
        const fallbackStream = new MediaStream();
        fallbackStream.addTrack(event.track);
        setRemoteStream(fallbackStream);
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        endCall(false);
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const getMediaStream = async (type) => {
    try {
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video:
          type === "video"
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: "user",
              }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      setIsMuted(false);
      setIsVideoOff(false);
      return stream;
    } catch (error) {
      console.warn("Failed to get requested media constraints:", error);
      // Fallback: If video failed, try audio only
      if (type === "video") {
        try {
          toast("Camera access denied or unavailable. Trying audio only...", { icon: "⚠️" });
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setLocalStream(audioOnlyStream);
          setCallType("audio");
          setIsMuted(false);
          setIsVideoOff(true);
          return audioOnlyStream;
        } catch (audioErr) {
          toast.error("Could not access microphone or camera");
          return null;
        }
      }
      toast.error("Could not access microphone");
      return null;
    }
  };

  // Socket Signaling Listeners
  useEffect(() => {
    if (!socket) return;

    const handleIncomingCall = (data) => {
      if (callState !== "idle") {
        // Automatically reject if already in a call
        const callerId = data.from?._id || data.from;
        socket.emit("end-call", { to: callerId });
        return;
      }

      setIncomingCallData(data);
      setCallState("ringing");

      const callerObj =
        typeof data.from === "object"
          ? data.from
          : { _id: data.from, fullName: "Caller", profilePic: "/logo.png" };

      setCallPartner(callerObj);
      setActiveUser(callerObj._id);
      setCallType(data.callType || "video");
      callSounds.playIncomingRingtone();
    };

    const handleCallAnswered = async (signal) => {
      try {
        callSounds.stop();
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
          setCallState("active");

          // Process queued ICE candidates
          while (candidateQueue.current.length > 0) {
            const candidate = candidateQueue.current.shift();
            try {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error("Error adding queued ice candidate:", err);
            }
          }
        }
      } catch (e) {
        console.error("Error handling call-answered:", e);
      }
    };

    const handleIceCandidate = async (candidate) => {
      try {
        if (pcRef.current && pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          candidateQueue.current.push(candidate);
        }
      } catch (e) {
        console.error("Error adding ice candidate:", e);
      }
    };

    const handleCallEnded = () => {
      callSounds.stop();
      toast("Call ended", { icon: "📞" });
      endCall(false);
    };

    const handleCallUnavailable = () => {
      callSounds.stop();
      toast.error("User is currently unavailable or offline");
      endCall(false);
    };

    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-answered", handleCallAnswered);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("call-ended", handleCallEnded);
    socket.on("call-unavailable", handleCallUnavailable);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-answered", handleCallAnswered);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("call-ended", handleCallEnded);
      socket.off("call-unavailable", handleCallUnavailable);
    };
  }, [socket, callState]);

  // Clean up if window closes during call
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activeUser && socket) {
        socket.emit("end-call", { to: activeUser });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [activeUser, socket]);

  // User Actions
  const initiateCall = async (targetUser, type = "video") => {
    const targetUserId = typeof targetUser === "object" ? targetUser._id : targetUser;
    const targetUserObj =
      typeof targetUser === "object"
        ? targetUser
        : { _id: targetUserId, fullName: "Contact", profilePic: "/logo.png" };

    if (!onlineUsers.includes(targetUserId)) {
      toast.error("User is currently offline");
      return;
    }

    const stream = await getMediaStream(type);
    if (!stream) return;

    setCallState("calling");
    setCallType(type);
    setCallPartner(targetUserObj);
    setActiveUser(targetUserId);
    callSounds.playCallingTone();

    const pc = initPeerConnection(targetUserId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === "video",
      });
      await pc.setLocalDescription(offer);

      socket.emit("call-user", {
        userToCall: targetUserId,
        signalData: offer,
        from: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
        },
        callType: type,
      });
    } catch (err) {
      console.error("Failed to create call offer:", err);
      toast.error("Failed to start call");
      resetCallState();
    }
  };

  const acceptCall = async () => {
    if (!incomingCallData) return;
    callSounds.stop();

    const type = incomingCallData.callType || "video";
    const callerId = incomingCallData.from?._id || incomingCallData.from;

    const stream = await getMediaStream(type);
    if (!stream) {
      rejectCall();
      return;
    }

    setCallState("active");
    setActiveUser(callerId);

    const pc = initPeerConnection(callerId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));

      // Flush queued candidates
      while (candidateQueue.current.length > 0) {
        const candidate = candidateQueue.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding queued ice candidate:", err);
        }
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: callerId,
        signal: answer,
      });
      setIncomingCallData(null);
    } catch (err) {
      console.error("Error accepting call:", err);
      toast.error("Failed to establish connection");
      rejectCall();
    }
  };

  const rejectCall = () => {
    callSounds.stop();
    if (incomingCallData) {
      const callerId = incomingCallData.from?._id || incomingCallData.from;
      socket.emit("end-call", { to: callerId });
      setIncomingCallData(null);
    }
    resetCallState();
  };

  const endCall = (emitEvent = true) => {
    callSounds.stop();
    callSounds.playEndCallTone();
    if (emitEvent && activeUser && socket) {
      socket.emit("end-call", { to: activeUser });
    }
    resetCallState();
  };

  const resetCallState = () => {
    callSounds.stop();
    setCallState("idle");
    setIncomingCallData(null);
    setActiveUser(null);
    setCallPartner(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setCallDuration(0);

    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }
    setRemoteStream(null);

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    candidateQueue.current = [];
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Sync streams to video and audio HTML elements safely
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      if (localVideoRef.current.srcObject !== localStream) {
        localVideoRef.current.srcObject = localStream;
      }
    }
    if (remoteVideoRef.current && remoteStream) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      remoteVideoRef.current.play().catch(() => {});
    }
    if (audioRef.current && remoteStream && callType === "audio") {
      if (audioRef.current.srcObject !== remoteStream) {
        audioRef.current.srcObject = remoteStream;
      }
      audioRef.current.play().catch(() => {});
    }
  }, [localStream, remoteStream, callState, callType]);

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        incomingCallData,
        callPartner,
        activeUser,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        callDuration,
        initiateCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleVideo,
        localVideoRef,
        remoteVideoRef,
        audioRef,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
