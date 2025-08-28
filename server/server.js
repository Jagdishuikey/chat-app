import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app)

//initalize socket server
export const io=new Server(server,{
  cors:{origin:"*"}
})
//store online users
export const userSocketMap={};//{userId:socketId}

//socket connnection handler
io.on("connection",(socket)=>{
  const userId=socket.handshake.query.userId;
  console.log("User Connected",userId);

  if(userId) userSocketMap[userId]=socket.id;

  //Emit online users to all connected clients
  io.emit("getOnlineUsers",Object.keys(userSocketMap));

  socket.on("disconnect",()=>{
    console.log("User Disconnected",userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap))


  })
})

//Middleware setup
app.use(express.json({limit:"10mb"}))
app.use(cors());


app.use("/api/status",(req, res) => res.send("Server is Live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter)

const PORT = process.env.PORT || 5000;


await connectDB();
if(process.env.NODE_ENV !== "production"){
  server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
}
export default server;

