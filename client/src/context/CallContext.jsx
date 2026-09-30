import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useChat } from "./ChatContext";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CallContext = createContext();

export const useCall = () => {
  return useContext(CallContext);
};

export const CallContextProvider = ({ children }) => {
  const { socket, onlineUsers } = useChat();
  const { authUser } = useAuth();

  const [callState, setCallState] = useState("idle"); // idle, ringing, calling, active
  const [callType, setCallType] = useState("video"); // video, audio
  const [incomingCallData, setIncomingCallData] = useState(null); // { from, signal, callType }
  const [activeUser, setActiveUser] = useState(null); // the user we are talking to

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const pcRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize WebRTC
  const initPeerConnection = (otherUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", { to: otherUserId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed" || pc.connectionState === "closed") {
        endCall(false);
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const getMediaStream = async (type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      toast.error("Could not access camera/microphone");
      console.error(error);
      return null;
    }
  };

  // Socket Listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", (data) => {
      if (callState !== "idle") {
        // Automatically reject if busy
        socket.emit("end-call", { to: data.from });
        return;
      }
      setIncomingCallData(data);
      setCallState("ringing");
      setActiveUser(data.from);
      setCallType(data.callType);
    });

    socket.on("call-answered", async (signal) => {
      try {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
          setCallState("active");
        }
      } catch (e) {
        console.error("Error handling call-answered", e);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        if (pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (e) {
        console.error("Error adding ice candidate", e);
      }
    });

    socket.on("call-ended", () => {
      endCall(false);
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-answered");
      socket.off("ice-candidate");
      socket.off("call-ended");
    };
  }, [socket, callState]);

  // Actions
  const initiateCall = async (userToCallId, type) => {
    if (!onlineUsers.includes(userToCallId)) {
      toast.error("User is offline");
      return;
    }

    const stream = await getMediaStream(type);
    if (!stream) return;

    setCallState("calling");
    setCallType(type);
    setActiveUser(userToCallId);

    const pc = initPeerConnection(userToCallId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call-user", {
      userToCall: userToCallId,
      signalData: offer,
      from: authUser._id,
      callType: type,
    });
  };

  const acceptCall = async () => {
    if (!incomingCallData) return;

    const stream = await getMediaStream(incomingCallData.callType);
    if (!stream) {
      rejectCall();
      return;
    }

    setCallState("active");

    const pc = initPeerConnection(incomingCallData.from);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.signal));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answer-call", {
      to: incomingCallData.from,
      signal: answer,
    });
    setIncomingCallData(null);
  };

  const rejectCall = () => {
    if (incomingCallData) {
      socket.emit("end-call", { to: incomingCallData.from });
      setIncomingCallData(null);
    }
    resetCallState();
  };

  const endCall = (emitEvent = true) => {
    if (emitEvent && activeUser && socket) {
      socket.emit("end-call", { to: activeUser });
    }
    resetCallState();
  };

  const resetCallState = () => {
    setCallState("idle");
    setIncomingCallData(null);
    setActiveUser(null);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  // Sync streams to video/audio tags
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (audioRef.current && remoteStream && callType === "audio") {
      audioRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream, callState, callType]);

  return (
    <CallContext.Provider
      value={{
        callState,
        callType,
        incomingCallData,
        activeUser,
        localStream,
        remoteStream,
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
