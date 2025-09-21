import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";

export const CallContext = createContext();

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject"
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject"
    }
  ]
};

export const CallProvider = ({ children }) => {
  const { socket, authUser } = useContext(AuthContext);

  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerUserIdRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [peerUserId, setPeerUserId] = useState(null);
  const [isCaller, setIsCaller] = useState(false);

  // queue for ICE before remoteDescription
  const pendingCandidates = useRef([]);

  // ------------------- Local Media -------------------
  const ensureLocalMedia = async () => {
    if (!localStreamRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () => {
          localVideoRef.current.play().catch((err) => {
            console.error("Local video play error:", err);
          });
        };
      }
    }
    return localStreamRef.current;
  };

// ------------------- Create PeerConnection -------------------
const createPeerConnection = () => {
  if (pcRef.current) {
    pcRef.current.close();
    pcRef.current = null;
  }

  const pc = new RTCPeerConnection(ICE_SERVERS);

  // Remote stream
  pc.ontrack = (event) => {
    
    const attachAndPlay = (mediaStream) => {
      if (!remoteVideoRef.current) return;
      remoteVideoRef.current.srcObject = mediaStream;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = true;
      
      // Add event listeners to handle video loading
      remoteVideoRef.current.onloadedmetadata = () => {
        // Attempt to play the remote video while keeping it muted by default
        // to satisfy autoplay policies. Do not auto-unmute here.
        remoteVideoRef.current.play().catch(() => {});
      };
      
      remoteVideoRef.current.onerror = (e) => {
        console.error("Remote video error:", e);
      };
    };
    if (event.streams && event.streams[0]) {
      attachAndPlay(event.streams[0]);
    } else {
      if (!pc.remoteStream) pc.remoteStream = new MediaStream();
      pc.remoteStream.addTrack(event.track);
      attachAndPlay(pc.remoteStream);
    }
  };

  // ICE candidate
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      if (socket && peerUserIdRef.current) {
        socket.emit("call:candidate", {
          toUserId: peerUserIdRef.current,
          candidate: event.candidate,
        });
      } else {
        pendingCandidates.current.push(event.candidate);
      }
    }
  };

  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'failed') {
      console.error("PeerConnection failed");
    }
  };
  
  pc.oniceconnectionstatechange = () => {
    if (pc.iceConnectionState === 'failed') {
      console.error("ICE connection failed");
    }
    // Optionally handle other states if needed
  };

  pcRef.current = pc;
  return pc;
};

// ------------------- Start a call -------------------
const startCall = async (toUserId) => {
  setIsCaller(true);
  setPeerUserId(toUserId);
  peerUserIdRef.current = toUserId;
  setInCall(true);

  const pc = createPeerConnection();
  const localStream = await ensureLocalMedia();

  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("call:offer", { toUserId, offer });
};

// ------------------- Accept a call -------------------
const acceptCall = async (fromUserId, offer) => {
  setIsCaller(false);
  setPeerUserId(fromUserId);
  peerUserIdRef.current = fromUserId;
  setInCall(true);

  await new Promise(resolve => setTimeout(resolve, 100));

  const pc = createPeerConnection();
  const localStream = await ensureLocalMedia();
  
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });

  await pc.setRemoteDescription(new RTCSessionDescription(offer));

  pendingCandidates.current.forEach((c) => {
    pc.addIceCandidate(new RTCIceCandidate(c));
  });
  pendingCandidates.current = [];

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  socket.emit("call:answer", { toUserId: fromUserId, answer });

  setRinging(false);
};

  // ------------------- Reject a call -------------------
  const rejectCall = () => {
    if (socket && peerUserId) {
      socket.emit("call:end", { toUserId: peerUserId });
    }
    cleanup();
  };

  // ------------------- End call -------------------
  const endCall = () => {
    if (socket && peerUserId) socket.emit("call:end", { toUserId: peerUserId });
    cleanup();
  };

  // ------------------- Cleanup -------------------
  const cleanup = () => {
    setInCall(false);
    setRinging(false);
    setPeerUserId(null);
    setIsCaller(false);
    peerUserIdRef.current = null;
    pendingCandidates.current = [];

    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.getSenders().forEach((s) => pcRef.current.removeTrack(s));
      pcRef.current.close();
      pcRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  };

  // ------------------- Socket events -------------------
  useEffect(() => {
  if (!socket) return;

  const onOffer = ({ fromUserId, offer }) => {
    setRinging(true);
    setPeerUserId(fromUserId);
    peerUserIdRef.current = fromUserId;
    acceptCall(fromUserId, offer);
  };

  const onAnswer = ({ fromUserId, answer }) => {
    if (pcRef.current) {
      pcRef.current.setRemoteDescription(new RTCSessionDescription(answer))
        .then(() => {
          if (pendingCandidates.current.length) {
            pendingCandidates.current.forEach((c) => {
              pcRef.current
                .addIceCandidate(new RTCIceCandidate(c))
                .catch((err) => console.error("Error adding ICE candidate:", err));
            });
            pendingCandidates.current = [];
          }
        })
        .catch((err) => console.error("Error setting remote description:", err));
    }
  };

  const onCandidate = ({ fromUserId, candidate }) => {
    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) {
      pendingCandidates.current.push(candidate);
      return;
    }
    pc.addIceCandidate(new RTCIceCandidate(candidate))
      .catch((err) => console.error("Error adding ICE candidate:", err));
  };

  const onEndCall = () => {
    endCall();
  };

  socket.on("call:offer", onOffer);
  socket.on("call:answer", onAnswer);
  socket.on("call:candidate", onCandidate);
  socket.on("call:end", onEndCall);

  return () => {
    socket.off("call:offer", onOffer);
    socket.off("call:answer", onAnswer);
    socket.off("call:candidate", onCandidate);
    socket.off("call:end", onEndCall);
  };
}, [socket]);

// Ensure local video is set when localVideoRef becomes available
useEffect(() => {
  if (localVideoRef.current && localStreamRef.current) {
    localVideoRef.current.srcObject = localStreamRef.current;
    localVideoRef.current.play().catch(() => {});
  }
}, [localVideoRef.current, localStreamRef.current]);

// Monitor remote video ref and ensure it gets the stream
useEffect(() => {
  if (inCall && remoteVideoRef.current && pcRef.current) {
    
    // Check if we already have a remote stream from the peer connection
    const pc = pcRef.current;
    const receivers = pc.getReceivers();
    const videoReceiver = receivers.find(r => r.track?.kind === 'video');
    const audioReceiver = receivers.find(r => r.track?.kind === 'audio');
    
    if (videoReceiver?.track || audioReceiver?.track) {
      const stream = new MediaStream();
      if (videoReceiver?.track) stream.addTrack(videoReceiver.track);
      if (audioReceiver?.track) stream.addTrack(audioReceiver.track);
      
      remoteVideoRef.current.srcObject = stream;
      remoteVideoRef.current.playsInline = true;
      remoteVideoRef.current.muted = true;
      
      remoteVideoRef.current.onloadedmetadata = () => {
        remoteVideoRef.current.play().catch(() => {});
      };
    }
  }
}, [inCall, remoteVideoRef.current]);


  return (
    <CallContext.Provider
      value={{
        inCall,
        ringing,
        isCaller,
        peerUserId,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};