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
export const io = new Server(server, {
  cors: { origin: "*" }
})
//store online users
export const userSocketMap = {};//{userId:socketId}

//socket connnection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  //Emit online users to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));


  
// 🟢 Video Call Offer
socket.on("call:offer", ({ toUserId, offer }) => {
  const targetSocketId = userSocketMap[toUserId];
  console.log(`📞 Offer from ${userId} -> ${toUserId} [socket:${targetSocketId}]`);
  if (targetSocketId) {
    io.to(targetSocketId).emit("call:offer", { fromUserId: userId, offer });
  }
});

// 🟢 Video Call Answer
socket.on("call:answer", ({ toUserId, answer }) => {
  const targetSocketId = userSocketMap[toUserId];
  console.log(`📨 Answer from ${userId} -> ${toUserId} [socket:${targetSocketId}]`);
  if (targetSocketId) {
    io.to(targetSocketId).emit("call:answer", { fromUserId: userId, answer });
  }
});

// 🟢 ICE Candidate Exchange
socket.on("call:candidate", ({ toUserId, candidate }) => {
  const targetSocketId = userSocketMap[toUserId];
  console.log(`❄️ ICE Candidate from ${userId} -> ${toUserId} [socket:${targetSocketId}]`);
  if (targetSocketId) {
    io.to(targetSocketId).emit("call:candidate", { fromUserId: userId, candidate });
  }
});

// 🟢 Handle Call End
socket.on("call:end", ({ toUserId }) => {
  const targetSocketId = userSocketMap[toUserId];
  console.log(`❌ Call end from ${userId} -> ${toUserId} [socket:${targetSocketId}]`);
  if (targetSocketId) {
    io.to(targetSocketId).emit("call:end");
  }
});




  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap))


  })
})

//Middleware setup
app.use(express.json({ limit: "10mb" }))
app.use(cors());


app.use("/api/status", (req, res) => res.send("Server is Live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)

const PORT = process.env.PORT || 5000;


await connectDB();
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
export default server;

