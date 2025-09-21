
import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import CryptoJS from 'crypto-js';
import { CallContext } from '../../context/CallContext.jsx';
import { toast } from 'react-hot-toast';

const SECRET_KEY = "your-strong-secret-key";

function encryptMessage(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decryptMessage(cipherText) {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption fails or returns empty, show the original text (for old/plain messages)
    return decrypted || cipherText;
  } catch {
    return cipherText;
  }
}

const ChatContainer = () => {

  const { messages, selectedUser, setSelectedUser,
    sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers, allUsers } = useContext(AuthContext)
  const { inCall, localVideoRef, remoteVideoRef, startCall, endCall } = useContext(CallContext);

  const scrollEnd = useRef()

  const [input, setInput] = useState('')
  const [pipSide, setPipSide] = useState('right'); // 'right' or 'left' for PIP position

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    const encrypted = CryptoJS.AES.encrypt(input.trim(), SECRET_KEY).toString();
    await sendMessage({ text: encrypted });
    setInput("");
  };

  //handle Sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("select an image file")
      return;
    }
    const reader = new FileReader();

    reader.onloadend = async () => {
      await sendMessage({ image: reader.result })
      e.target.value = ""
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id)
    }
  }, [selectedUser])

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  return selectedUser ? (<div className='h-full overflow-scroll relative backdrop-blur-lg'>
    {/* //header */}
    <div className='flex items-center gap-3 py-3 mx-4 border-b border-stone-500'>
      <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 rounded-full' />
      <p className='flex-1 text-lg text-white flex items-center gap-2'>
        {selectedUser.fullName}
        {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}
      </p> <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="" className='md:hidden max-w-7' />
      <img src={assets.help_icon} alt="" className="max-md:hidden w-4 h-4" />
      {!inCall ? (<button onClick={() => startCall(selectedUser._id)}
        className="px-3 py-1 rounded bg-violet-600 text-white text-sm" > Call </button>)
        : (<button onClick={endCall} className="px-3 py-1 rounded bg-red-600 text-white text-sm" > End </button>)}
    </div>
    {/* Video Call Section - Enhanced UI */}
    {inCall && (
      <div className="relative bg-black h-96 rounded overflow-hidden">
        {/* Remote video with subtle fade-in */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover bg-black transition-opacity duration-700 ease-in-out opacity-95 z-0 pointer-events-none"
        />

        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-black/30 z-10 pointer-events-none" />

        {/* Caller info */}
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/40 px-3 py-2 rounded backdrop-blur-sm">
          <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-9 h-9 rounded-full border border-white/20" />
          <div className="text-white">
            <div className="text-sm font-semibold">{selectedUser.fullName}</div>
            <div className="text-xs text-gray-300">Live • Connected</div>
          </div>
        </div>

        {/* PIP local preview anchored to very bottom-left/right */}
  <div className={`absolute bottom-2 ${pipSide === 'right' ? 'right-4' : 'left-4'} w-36 h-24 bg-gradient-to-br from-black/60 to-black/40 border border-white/10 rounded-lg overflow-hidden shadow-2xl flex flex-col z-40`}> 
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          <div className="absolute left-2 bottom-2 bg-black/60 text-xs text-white px-2 py-0.5 rounded">You</div>
        </div>

        {/* Circular control menu center-bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-16 flex items-center justify-center z-30">
          <div className="bg-black/60 p-3 rounded-full flex items-center gap-4 shadow-xl backdrop-blur-md">
            {/* Mic */}
            <button
              onClick={() => {
                const stream = localVideoRef.current?.srcObject;
                if (stream) {
                  const audioTrack = stream.getAudioTracks()[0];
                  if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
                }
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Toggle Microphone"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1v11m0 0a3 3 0 003-3V4a3 3 0 00-6 0v5a3 3 0 003 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0" />
              </svg>
            </button>

            {/* Camera */}
            <button
              onClick={() => {
                const stream = localVideoRef.current?.srcObject;
                if (stream) {
                  const videoTrack = stream.getVideoTracks()[0];
                  if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
                }
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Toggle Camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618V15.382a1 1 0 01-1.447.894L15 13v-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7a2 2 0 00-2 2v6a2 2 0 002 2h7" />
              </svg>
            </button>

            {/* Remote audio toggle */}
            <button
              onClick={() => {
                if (remoteVideoRef.current) remoteVideoRef.current.muted = !remoteVideoRef.current.muted;
              }}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Toggle Remote Audio"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5L6 9H2v6h4l5 4V5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9a4 4 0 010 6" />
              </svg>
            </button>

            {/* Toggle PIP side */}
            <button
              onClick={() => setPipSide(pipSide === 'right' ? 'left' : 'right')}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white"
              title="Move PIP side"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4M8 15l4 4 4-4" />
              </svg>
            </button>

            {/* End call (prominent) */}
            <button
              onClick={() => endCall()}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md"
              title="End Call"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )}

    {/* chatarea */}
    <div className='flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6'>
      {messages.map((msg, index) => (
        <div key={index} className={`flex items-end gap-2 justify-end ${msg.senderId !== authUser._id && 'flex-row-reverse'}`}>
          {msg.image ? (
            <img src={msg.image} alt="" className='max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8' />
          ) : (
            <p className={`p-2 max-w-[200px] md:text-sm font-light rounded0lg mb-8 break-all bg-violet-500/30 text-white ${msg.senderId === authUser._id ? 'rounded-br-none' :
              'rounded-bl-none'
              }`}>
              {decryptMessage(msg.text)}
            </p>
          )}
          <div className='text-center text-xs'>
            <img src={msg.senderId === authUser._id ?
              authUser?.profilePic || assets.avatar_icon : selectedUser?.profilePic || assets.avatar_icon}
              alt="" className='w-7 rounded-full' />
            <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
          </div>
        </div>
      ))}
      <div ref={scrollEnd}></div>
    </div>
    {/* botom area */}
    <div className='absolute bottom-0 left-right-0 flex items-center gap-3 p-3'>
      <div className='flex-1 flex itmes-center bg-gray-100/12 px-3 rounded-full'>
        <input onChange={(e) => setInput(e.target.value)} value={input}
          onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null} type="text" placeholder='send a message' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white w-[300px] placeholder-gray-400' />
        <input onChange={handleSendImage} type="file" id='image' accept='image/png,image/jpeg' hidden />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" className='w-5 mr-4 cursor-pointer mt-3' />
        </label>
      </div>
      <img onClick={handleSendMessage} src={assets.send_button} alt="" className='w-7 cursor-pointer' />
    </div>
  </div>
  ) : (
    <div className='flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden'>
      <img src={assets.Chillchat} className='w-36 md:w-36' alt="" />
      <p className='text-lg font-medium text-white'>Chill and Chat</p>
    </div>
  )
}

export default ChatContainer;
