import React, { useContext, useState } from 'react'
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Profile = () => {
const{authUser,updateProfile} =useContext(AuthContext)

  const [selectedImg,setSelectedImg]=useState(null)
  const navigate= useNavigate();
  const [name,setName]=useState(authUser.fullName)
  const [bio,setBio]=useState(authUser.bio)

const handleSubmit=async(e)=>{
  e.preventDefault();
  if(!selectedImg){
    await updateProfile({fullName:name,bio});
    navigate('/');
    return;
  }
  const reader=new FileReader();
  reader.readAsDataURL(selectedImg);
  reader.onload=async()=>{
    const base64Image=reader.result;
    await updateProfile({profilePic:base64Image,fullName: name, bio});
    navigate('/');
  }
  
}

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center
    justify-center'>
      <div className='w-4/5 max-w-lg backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex-items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit } action="" className='flex flex-col gap-4 p-6 flex-1'>
          <h3 className='text-base font-medium'>Profile Details</h3>
          <label htmlFor="avatar"className='flex items-center gap-3 cursor-pointer'>
              <input onChange={(e)=>setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden />
              <img src={selectedImg ? URL.createObjectURL(selectedImg): assets.avatar_icon} alt=""
              className={`w-10 h-10 ${selectedImg && 'rounded-full'}`} />
              upload Profile Image
          </label>
          <input onChange={(e)=>setName(e.target.value)} value={name}
           type="text"  required placeholder='Your Name'className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2'/>
         <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder='Write profile bio' required className='p-2 border border-gray-500 rounded-s-md focus:outline-none focus:ring-2 focus:ring-violet-500 ' rows={3}></textarea>
         <button type='submit' className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-base cursor-pointer'>
          Save
         </button>
        </form>
        <img className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 $ {selectedImg && 'rounded-full'}`} src={authUser?.profilrPic ||assets.Chillchat} alt="" />
        
      </div>
    </div>
    
  )
}

export default Profile
