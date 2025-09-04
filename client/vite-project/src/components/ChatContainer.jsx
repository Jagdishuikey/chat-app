
import React, { useContext, useEffect, useRef, useState } from 'react';
import assets, { messagesDummyData } from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import CryptoJS from 'crypto-js';
import { CallContext } from '../../context/CallContext.jsx';

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
  const [remotePlaying, setRemotePlaying] = useState(false);

  const scrollEnd = useRef()

  const [input, setInput] = useState('')



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
    {/* Video Call Section */}
    {inCall && (
      <div className="flex gap-2 justify-center items-center p-2 bg-black h-96 relative">

        {/* Ringing Indicator */}
        {!remoteVideoRef.current?.srcObject && (
          <p className="absolute top-2 left-1/2 transform -translate-x-1/2 text-white text-sm">
            Ringing...
          </p>
        )}

        {/* Local Video */}
        <div className="flex flex-col items-center w-1/2">
          <p className="text-white mb-1">You</p>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full border rounded bg-gray-900"
          />
        </div>

        {/* Remote Video */}
        <div className="flex flex-col items-center w-1/2">
          <p className="text-white mb-1">Receiver</p>
          <div className="relative w-full h-full">
            {!remotePlaying && (
              <button
                className="absolute inset-0 z-10 flex items-center justify-center text-white bg-black/40 text-sm"
                onClick={() => {
                  if (remoteVideoRef.current) {
                    remoteVideoRef.current.muted = false;
                    remoteVideoRef.current.play().then(() => setRemotePlaying(true)).catch(() => {});
                  }
                }}
              >
                Tap to play audio/video
              </button>
            )}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              onPlay={() => setRemotePlaying(true)}
              onPause={() => setRemotePlaying(false)}
              className="w-full h-full border rounded bg-gray-900"
            />
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
          onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null} type="text" paceholder='send a messsage' className='flex-1 text-sm p-3 border-none rounded-lg outline-none text-white w-[300px] placeholder-gray-400' />
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
