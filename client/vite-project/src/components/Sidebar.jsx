import React, { useState, useEffect, useRef } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import axios from 'axios';

const Sidebar = () => {
  const{getUsers,users,selectedUser,setSelectedUser
    ,unseenMessages,setUnseenMessages}=useContext(ChatContext)

  const {logout,onlineUsers} =useContext(AuthContext);

  const[input,setInput]= useState("false")

  const filteredUsers = input ? users.filter((user)=>user.fullName.toLowerCase().includes(input.toLowerCase())) : users;


  useEffect(()=>{
    getUsers();
  },[onlineUsers])


  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div
      className={` bg-[#8185b2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-black transition-all duration-300 ${
        selectedUser ? 'max-md:hidden' : ''
      }`}
    >
      {/* Header */}
      <div className=" -mt-2  pb-6 border-b border-gray-600">
        <div className="flex justify-between items-center h-20">
          <img
            src={assets.Chillchat}
            alt="ChillChat Logo"
            className="w-32 md:w-36"
          />

          {/* Menu Dropdown */}
          <div className="relative" ref={menuRef}>
            <img
              src={assets.menu_icon}
              alt="Menu"
              className="w-5 h-5 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-36 rounded-md bg-[#282142] border border-gray-600 text-sm text-gray-100 shadow-lg z-20">
                <div
                  onClick={() => {
                    navigate('/profile');
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-[#3a335c] cursor-pointer"
                >
                  Edit Profile
                </div>
                <hr className="border-gray-600 mx-2" />
                <div 
                  onClick={() => {
                    // Handle logout logic here
                    logout()
                    console.log('Logout clicked');
                    setIsMenuOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-[#3a335c] cursor-pointer"
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='bg-[#282142] rounded-full flex items-center gap-2 h-10'>
            <img src={assets.search_icon} alt="search" className='w-3' />
            <input onChange={(e)=>setInput(e.target.value)}type="text" className='bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1' placeholder='SearchUser' />
        </div>
      </div>

      {/* Add other sidebar content here */}
      <div className='flex flex-col'>
        {filteredUsers.map((user,index)=>(
          <div onClick={()=>{
            setSelectedUser(user)
          }} key={index} className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id == user._id && 'bg-[#282142]/50'}`}>
            <img src={user?.profilePic || assets.avatar_icon} alt=""
            className='w-[35px] aspect-[1/1] rounded-full' />
            <div className='flex flex-col leading-5'>
              <p>{user.fullName}</p>
              {
                onlineUsers.includes(user._id)
                ?<span className='text-green-400 text-xs'>Online</span>
                :<span className='text-neutral-400 text-xs'>Offline</span>
              }
            </div>
            {unseenMessages[user._id]>0 && <p className='absolute top-4 right-4 text-xs h-5 w-5 flex justify-center rounded-full bg-violet-500/50'>{unseenMessages[user._id]}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
