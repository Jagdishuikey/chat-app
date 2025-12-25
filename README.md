💬 ChatApp – Real-Time Chat Application

A real-time chat application built using React (Vite) for the frontend and Node.js + Express + Socket.IO for the backend.
This project demonstrates real-time communication & VideoCall, state management using Context Api, and a scalable client–server architecture.

📁 Project Structure
chatapp/
│
├── client/
│   └── vite-project/
│       ├── context/          # Global state & context (auth, chat, socket)
│       ├── public/           # Static assets
│       ├── src/              # Main React source code
│       ├── index.html
│       ├── vite.config.js
│       ├── vercel.json
│       ├── package.json
│       └── README.md
│
├── server/
│   ├── routes/               # API routes
│   ├── controllers/          # Business logic
│   ├── models/               # Database schemas
│   ├── socket/               # Socket.IO logic
│   ├── index.js              # Server entry point
│   └── .gitignore
│
└── README.md

🚀 Features

🔐 User Authentication

💬 Real-time Messaging using Socket.IO

👥 One-to-One Chat

🟢 Online / Offline Status

⚡ Instant UI updates without refresh

📱 Responsive UI

🌐 Deployed frontend using Vercel

🛠️ Tech Stack
Frontend (Client)

React.js (Vite)

Context API

Tailwind CSS

Axios

Backend (Server)

Node.js

Express.js

Socket.IO

WebRTC

Database

MongoDB

⚙️ Installation & Setup
1️⃣ Clone the repository
git clone https://github.com/your-username/chatapp.git
cd chatapp

2️⃣ Setup Backend
cd server
npm install
npm start


Create a .env file inside server:

PORT=5000
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret

3️⃣ Setup Frontend
cd client/vite-project
npm install
npm run dev


Frontend will run on:

http://localhost:5173


Backend will run on:

http://localhost:5000

🔄 How Real-Time Chat Works (Simple)

User logs in

Socket.IO creates a live connection

Messages are sent instantly via sockets

Messages are stored in MongoDB

UI updates in real time for both users

<img width="1920" height="1128" alt="Screenshot 2025-09-22 115544" src="https://github.com/user-attachments/assets/579d81e6-dc75-4e18-94df-826875b00fa0" />


🚧 Future Improvements

Group Chats

Image & File Sharing

Message Read Receipts

Typing Indicator

Voice / Video Calling

👨‍💻 Author

Jagdish Uikey
Web Developer | MERN Stack Enthusiast

GitHub: your-github-link

LinkedIn: your-linkedin-link

⭐ Support

If you found this project useful, don’t forget to star ⭐ the repository!
