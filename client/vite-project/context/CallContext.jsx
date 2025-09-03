import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";

export const CallContext = createContext();

const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }) => {
  const { socket, authUser } = useContext(AuthContext);

  const pcRef = useRef(null); // PeerConnection
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [ringing, setRinging] = useState(false);
  const [peerUserId, setPeerUserId] = useState(null);
  const [isCaller, setIsCaller] = useState(false);

  // Queue ICE candidates before remoteDescription is set
  const pendingCandidates = useRef([]);

  // ------------------- Get local media -------------------
  const ensureLocalMedia = async () => {
    if (!localStreamRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.onloadedmetadata = () =>
          localVideoRef.current.play().catch(console.error);
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
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.onloadedmetadata = () =>
          remoteVideoRef.current.play().catch(() => {});
      }
    };

    // ICE candidate
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && peerUserId) {
        socket.emit("call:candidate", {
          toUserId: peerUserId,
          candidate: event.candidate,
        });
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // ------------------- Start a call -------------------
  const startCall = async (toUserId) => {
    setIsCaller(true);
    setPeerUserId(toUserId);

    const pc = createPeerConnection();
    const localStream = await ensureLocalMedia();

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("call:offer", { toUserId, offer });
    setInCall(true);
  };

  // ------------------- Accept a call -------------------
  const acceptCall = async (fromUserId, offer) => {
    setIsCaller(false);
    setPeerUserId(fromUserId);

    const pc = createPeerConnection();
    const localStream = await ensureLocalMedia();
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    await pc.setRemoteDescription(new RTCSessionDescription(offer));

    // Add any queued ICE candidates
    pendingCandidates.current.forEach((c) =>
      pc.addIceCandidate(new RTCIceCandidate(c))
    );
    pendingCandidates.current = [];

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("call:answer", { toUserId: fromUserId, answer });

    setRinging(false);
    setInCall(true);
  };

  // ------------------- Reject a call -------------------
  const rejectCall = () => {
    if (socket && peerUserId) {
      socket.emit("call:end", { toUserId: peerUserId });
    }
    cleanup();
  };

  // ------------------- End the call -------------------
  const endCall = () => {
    if (socket && peerUserId) socket.emit("call:end", { toUserId: peerUserId });
    cleanup();
  };

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

    const onOffer = ({ fromUserId, offer }) => {
      setRinging(true);
      setPeerUserId(fromUserId);

      // 👉 Now user must manually call acceptCall() or rejectCall()
      // Example: UI will show Accept/Reject buttons
    };

    const onAnswer = async ({ fromUserId, answer }) => {
      if (pcRef.current && isCaller) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        pendingCandidates.current.forEach((c) =>
          pcRef.current.addIceCandidate(new RTCIceCandidate(c))
        );
        pendingCandidates.current = [];
      }
    };

    const onCandidate = ({ candidate }) => {
      if (!pcRef.current || !pcRef.current.remoteDescription) {
        pendingCandidates.current.push(candidate);
      } else {
        pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
      }
    };

    const onEnd = () => cleanup();

    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:candidate", onCandidate);
    socket.on("call:end", onEnd);

    return () => {
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:candidate", onCandidate);
      socket.off("call:end", onEnd);
    };
  }, [socket]); // 👈 only depends on socket

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
