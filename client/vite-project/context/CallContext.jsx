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

  const [inCall, setInCall] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [peerUserId, setPeerUserId] = useState(null);
  const [isCaller, setIsCaller] = useState(false);

  // queue for ICE before remoteDescription
  const pendingCandidates = useRef([]);

  // ------------------- Local Media -------------------
  const ensureLocalMedia = async () => {
  if (!localStreamRef.current) {
    console.log("🎥 Requesting local media...");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStreamRef.current = stream;
    console.log("✅ Local media stream obtained:", stream);

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      console.log("📺 localVideoRef.srcObject:", localVideoRef.current?.srcObject);

      localVideoRef.current.onloadedmetadata = () => {
        console.log("🎬 Local video metadata loaded");
        console.log("🎤 Audio tracks:", stream.getAudioTracks());
        console.log("🎥 Video tracks:", stream.getVideoTracks());
        localVideoRef.current.play().catch((err) => {
          console.error("⚠️ Local video play error:", err);
        });
      };
      
    }
  }
  return localStreamRef.current;
};

// ------------------- Create PeerConnection -------------------
const createPeerConnection = () => {
  if (pcRef.current) {
    console.log("♻️ Closing old PeerConnection");
    pcRef.current.close();
    pcRef.current = null;
  }

  console.log("🔗 Creating new RTCPeerConnection...");
  const pc = new RTCPeerConnection(ICE_SERVERS);

  // Remote stream
  pc.ontrack = (event) => {
    console.log("📡 Remote track received:", event.streams, event.track);

    const attachAndPlay = (mediaStream) => {
      if (!remoteVideoRef.current) return;
      remoteVideoRef.current.srcObject = mediaStream;
      remoteVideoRef.current.playsInline = true;
      // Start muted to satisfy autoplay policies, then unmute after playback starts
      remoteVideoRef.current.muted = true;
      // Try to play immediately
      remoteVideoRef.current
        .play()
        .then(() => {
          console.log("🎬 Remote video playing (immediate)");
        })
        .catch((err) => console.warn("⚠️ Remote immediate play defer:", err?.name || err));
      remoteVideoRef.current.onloadedmetadata = () => {
        remoteVideoRef.current
          .play()
          .then(() => {
            console.log("🎬 Remote video playing (onloadedmetadata)");
          })
          .catch((err) => console.error("⚠️ Remote video play error:", err));
      };
    };

    if (event.streams && event.streams[0]) {
      console.log("✅ Remote stream set via event.streams[0]");
      attachAndPlay(event.streams[0]);
    } else {
      // Fallback: manually add tracks to a new MediaStream
      if (!pc.remoteStream) {
        pc.remoteStream = new MediaStream();
      }
      pc.remoteStream.addTrack(event.track);
      console.log("✅ Remote stream set via manual MediaStream");
      attachAndPlay(pc.remoteStream);
    }
  };


  // ICE candidate
  pc.onicecandidate = (event) => {
    if (event.candidate && socket && peerUserId) {
      console.log("❄️ Sending ICE candidate:", event.candidate);
      socket.emit("call:candidate", {
        toUserId: peerUserId,
        candidate: event.candidate,
      });
    }
  };

  pc.onconnectionstatechange = () => {
    console.log("🔌 Connection state:", pc.connectionState);
  };
  pc.oniceconnectionstatechange = () => {
    console.log("🧊 ICE connection state:", pc.iceConnectionState);
  };

  pcRef.current = pc;
  return pc;
};

// ------------------- Start a call -------------------
const startCall = async (toUserId) => {
  console.log("📞 Starting call to:", toUserId);
  setIsCaller(true);
  setPeerUserId(toUserId);
  // Ensure call UI mounts so refs exist before attaching streams
  setInCall(true);

  const pc = createPeerConnection();
  const localStream = await ensureLocalMedia();

  localStream.getTracks().forEach((track) => {
    console.log("➕ Adding track to PeerConnection:", track);
    pc.addTrack(track, localStream);
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  console.log("📨 Sending offer:", offer);
  socket.emit("call:offer", { toUserId, offer });
};

// ------------------- Accept a call -------------------
const acceptCall = async (fromUserId, offer) => {
  console.log("📞 Accepting call from:", fromUserId);
  setIsCaller(false);
  setPeerUserId(fromUserId);
  // Ensure call UI mounts so refs exist before attaching streams
  setInCall(true);

  const pc = createPeerConnection();
  const localStream = await ensureLocalMedia();
  localStream.getTracks().forEach((track) => {
    console.log("➕ Adding local track in acceptCall:", track);
    pc.addTrack(track, localStream);
  });

  await pc.setRemoteDescription(new RTCSessionDescription(offer));
  console.log("✅ Remote description set with offer");

  pendingCandidates.current.forEach((c) => {
    console.log("📥 Adding queued ICE candidate:", c);
    pc.addIceCandidate(new RTCIceCandidate(c));
  });
  pendingCandidates.current = [];

  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);

  console.log("📨 Sending answer:", answer);
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

  // 📡 Incoming Offer
  const onOffer = ({ fromUserId, offer }) => {
    console.log("📡 Incoming offer from:", fromUserId, offer);

    // 🔔 Show ringing UI (optional)
    setRinging(true);
    setPeerUserId(fromUserId);

    // 👉 For now, auto-accept to debug end-to-end
    acceptCall(fromUserId, offer);
  };

  // 📩 Incoming Answer
  const onAnswer = ({ fromUserId, answer }) => {
    console.log("📥 Answer received from:", fromUserId, answer);

    if (pcRef.current) {
      pcRef.current.setRemoteDescription(new RTCSessionDescription(answer))
        .then(() => {
          console.log("✅ Remote description set with answer");
          // Flush any pending candidates queued before remoteDescription was set
          if (pendingCandidates.current.length) {
            pendingCandidates.current.forEach((c) => {
              pcRef.current
                .addIceCandidate(new RTCIceCandidate(c))
                .then(() => console.log("✅ Flushed queued ICE candidate"))
                .catch((err) => console.error("❌ Error flushing queued ICE:", err));
            });
            pendingCandidates.current = [];
          }
        })
        .catch((err) => console.error("❌ Error setting remote desc with answer:", err));
    } else {
      console.warn("⚠️ No PeerConnection when answer received");
    }
  };

  // ❄️ Incoming ICE Candidate
  const onCandidate = ({ fromUserId, candidate }) => {
    console.log("❄️ ICE candidate received from:", fromUserId, candidate);

    const pc = pcRef.current;
    if (!pc || !pc.remoteDescription) {
      console.log("📥 Queueing ICE candidate (no PC or no remoteDescription yet)");
      pendingCandidates.current.push(candidate);
      return;
    }
    pc.addIceCandidate(new RTCIceCandidate(candidate))
      .then(() => console.log("✅ ICE candidate added"))
      .catch((err) => console.error("❌ Error adding ICE candidate:", err));
  };

  // ❌ Call End
  const onEndCall = () => {
    console.log("❌ Call ended by remote user");
    endCall();
  };

  // 🔗 Attach socket listeners
  socket.on("call:offer", onOffer);
  socket.on("call:answer", onAnswer);
  socket.on("call:candidate", onCandidate);
  socket.on("call:end", onEndCall);

  // 🧹 Cleanup
  return () => {
    socket.off("call:offer", onOffer);
    socket.off("call:answer", onAnswer);
    socket.off("call:candidate", onCandidate);
    socket.off("call:end", onEndCall);
  };
}, [socket]);


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
