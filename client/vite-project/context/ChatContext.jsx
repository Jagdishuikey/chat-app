import { useContext } from "react";
import { createContext } from "react";
import { AuthContext } from "./AuthContext";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useState } from "react";



export const ChatContext= createContext();

export const ChatProvider=({children})=>{
    const[messages,setMessages]=useState([]);
    const[users,setUsers]=useState([]);
    const[selectedUser,setSelectedUser]=useState(null)
    const[unseenMessages,setUnseenMessages]=useState({})
    const [allUsers, setAllUsers] = useState([]);

    const {socket,axios,token,checkAuth}=useContext(AuthContext);

    //functin to get user to sidebar
    const getUsers=async()=>{
        try {
            const{data}=await axios.get("/api/auth/all-users")
            console.log(users)
            if(data.success){
                setAllUsers(data.users)
                setUnseenMessages(data.unseenMessages)
                console.log("Fetched users:", data.users);

            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    useEffect(() => {
     if (token) {
       axios.defaults.headers.common['token'] = token;
        checkAuth();
         getUsers();
  }
}, [token]);


    //function to get message for seslected user
    const getMessages=async(userId)=>{
        try {
            const{data}=await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }
    //function to send mess to selected user

    const sendMessage=async(messageData)=>{
        try {
            const{data}=await axios.post(`/api/messages/send/${selectedUser._id}`,messageData)
            if(data.success){
                setMessages((prevMessages)=>[...prevMessages,data.newMessage])
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };
    

    //function to subscribe to messages for selected users

    const subscribeToMessages=async()=>{
        if(!socket)return;


        socket.on("newMessage",(newMessage)=>{
            if(selectedUser && newMessage.senderId === selectedUser._id){
                newMessage.seen=true;
                setMessages((prevMessages)=>[...prevMessages,newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
            }else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages,[newMessage.senderId] : 
                    prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages
                    [newMessage.senderId] + 1 : 1
                }))
            }
        })
    }
    //function to unsubscribe from messages
    const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage")
    }

    useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
    },[socket,selectedUser])

    const value ={
        messages,users,selectedUser,getUsers,getMessages,sendMessage,setSelectedUser,
        unseenMessages,setUnseenMessages,allUsers
    }
    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}