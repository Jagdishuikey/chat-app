import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import toast from "react-hot-toast";
import { io } from 'socket.io-client';

const backendUrl=import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL=backendUrl;

export const AuthContext=createContext();

export const AuthProvider=({ children })=>{

    const[token,setToken]=useState(localStorage.getItem("token"));
    const[authUser,setAuthUser]=useState(null);
    const[onlineUsers,setOnlineUsers]=useState([]);
    const[socket,setSocket]=useState(null);





//check if user is authenticated if so set the user data and connect the socket

    const checkAuth=async()=>{
        try {
            const {data}=await axios.get("/api/auth/check")
            if(data.success){
                setAuthUser(data.user)
                connectSocket(data.user)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }
    //login function to habdle user authentocation and socket connnection

    const login = async (endpoint, credentials) => {
  try {
    const res = await axios.post(`/api/auth/${endpoint}`, credentials);
    if (res.data.success) {
      localStorage.setItem("token", res.data.token); // save the token
      setAuthUser(res.data.user); // save user data in state/context
      return true;
    }
    return false;
  } catch (error) {
    console.error("Login failed", error);
    return false;
  }
};
 

    //logout functon for logout and deconnection of socket

    const logout=async()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([])
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged Out Sucessfully")
        socket.disconnect();
    }

    //function for update profile for user
    const updateProfile =async(body)=>{
        try {
            const{data}=await axios.put("/api/auth/update-profile",body);
            if(data.success){
                setAuthUser(data.user);
                toast.success("Profile updated Successfully")
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    //connect socket frunction to socket coonnection and onlone users update
    const connectSocket=(userData)=>{
        if(!userData || socket?.connected)return;
        const newSocket=io(backendUrl,{
            query:{
                userId:userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }

    useEffect(()=>{
        if(token){
            axios.defaults.headers.common['token']=token;
            checkAuth();
        }
        
    },[token])


    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }
    return(
        <AuthContext.Provider value={value}>
         {children}
        </AuthContext.Provider> 
    )
}