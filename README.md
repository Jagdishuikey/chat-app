<div align="center">

# 💬 ChillChat

### A real-time chat application with video calling, end-to-end encryption, and image sharing

[![React](https://img.shields.io/badge/React-19.1-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Project Structure](#-project-structure) · [Deployment](#-deployment) · [Contributing](#-contributing)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 **Real-Time Messaging** | Instant message delivery powered by Socket.IO with online user presence indicators |
| 🔒 **End-to-End Encryption** | Messages encrypted client-side using AES encryption via CryptoJS |
| 📹 **Video Calling** | Peer-to-peer video calls using WebRTC with STUN/TURN server support |
| 🖼️ **Image Sharing** | Send images in chat with Cloudinary-backed storage |
| 👤 **User Profiles** | Customizable profiles with avatar upload and bio |
| 🟢 **Online Status** | Real-time online/offline user presence tracking |
| 👁️ **Read Receipts** | Message seen/unseen status with unread message counts |
| 🔐 **JWT Authentication** | Secure token-based authentication with protected routes |
| 📱 **Responsive Design** | Glassmorphism UI that works seamlessly on desktop and mobile |

---

## 🛠 Tech Stack

### Frontend
- **React 19** — UI library with Context API for state management
- **Vite 7** — Lightning-fast build tool and dev server
- **Tailwind CSS 4** — Utility-first CSS framework
- **Socket.IO Client** — Real-time bidirectional communication
- **CryptoJS** — AES encryption for message security
- **WebRTC** — Peer-to-peer video calling
- **React Router DOM v7** — Client-side routing
- **React Hot Toast** — Toast notifications
- **Axios** — HTTP client for API requests

### Backend
- **Express 5** — Web framework for Node.js
- **MongoDB + Mongoose 8** — NoSQL database with ODM
- **Socket.IO** — Real-time event-based communication
- **Cloudinary** — Cloud-based image hosting and management
- **bcryptjs** — Password hashing
- **JSON Web Tokens** — Stateless authentication
- **dotenv** — Environment variable management

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MongoDB** — [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud) or local instance
- **Cloudinary** — [Free account](https://cloudinary.com/) for image uploads

### 1. Clone the repository

```bash
git clone https://github.com/Jagdishuikey/chat-app.git
cd chat-app
```

### 2. Set up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

Start the server:

```bash
npm run server     # Development (with nodemon)
# or
npm start          # Production
```

### 3. Set up the Frontend

```bash
cd client/vite-project
npm install
```

Create a `.env` file in the `client/vite-project/` directory:

```env
VITE_BACKEND_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

### 4. Open the app

Navigate to `http://localhost:5173` in your browser.

---

## 📡 API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/signup` | ✗ | Register a new user |
| `POST` | `/login` | ✗ | Login with email & password |
| `GET` | `/check` | ✓ | Verify authentication status |
| `PUT` | `/update-profile` | ✓ | Update profile picture, bio, or name |
| `GET` | `/all-users` | ✓ | Get all registered users |

### Messages — `/api/messages`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/users` | ✓ | Get sidebar users with unread counts |
| `GET` | `/:id` | ✓ | Get conversation with a specific user |
| `POST` | `/send/:id` | ✓ | Send a text or image message |
| `PUT` | `/mark/:id` | ✓ | Mark a message as seen |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `getOnlineUsers` | Server → Client | Broadcast online user list |
| `newMessage` | Server → Client | Deliver new message to receiver |
| `call:offer` | Bidirectional | Initiate a video call (WebRTC offer) |
| `call:answer` | Bidirectional | Accept a video call (WebRTC answer) |
| `call:candidate` | Bidirectional | Exchange ICE candidates |
| `call:end` | Bidirectional | End an ongoing video call |

---

## 📁 Project Structure

```
chat-app/
├── client/
│   └── vite-project/
│       ├── context/                # React Context providers
│       │   ├── AuthContext.jsx     # Authentication & socket management
│       │   ├── ChatContext.jsx     # Chat state & message handling
│       │   └── CallContext.jsx     # WebRTC video call management
│       ├── src/
│       │   ├── assets/             # Static images, icons, SVGs
│       │   ├── components/
│       │   │   ├── ChatContainer.jsx   # Main chat UI with encryption
│       │   │   ├── Sidebar.jsx         # User list sidebar
│       │   │   └── RightSidebar.jsx    # User profile sidebar
│       │   ├── lib/
│       │   │   └── utils.js        # Utility functions (time formatting)
│       │   ├── pages/
│       │   │   ├── HomePage.jsx    # Main chat page layout
│       │   │   ├── Login.jsx       # Login page
│       │   │   ├── Signup.jsx      # Registration page
│       │   │   └── Profile.jsx     # User profile page
│       │   ├── App.jsx             # Root component with routing
│       │   └── main.jsx            # App entry point
│       ├── index.html
│       ├── vite.config.js
│       └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js                   # MongoDB connection
│   │   ├── cloudinary.js           # Cloudinary configuration
│   │   └── utils.js                # JWT token generation
│   ├── controllers/
│   │   ├── UserController.js       # Auth & profile logic
│   │   └── messageController.js    # Messaging logic
│   ├── middleware/
│   │   └── auth.js                 # JWT authentication guard
│   ├── model/
│   │   ├── UserModel.js            # User schema
│   │   └── Message.js              # Message schema
│   ├── routes/
│   │   ├── userRoutes.js           # Auth & user endpoints
│   │   └── messageRoutes.js        # Message endpoints
│   ├── server.js                   # Express + Socket.IO entry point
│   ├── vercel.json                 # Vercel deployment config
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🌐 Deployment

The app is configured for deployment on **Vercel**.

### Backend (Vercel Serverless)

The `server/vercel.json` is pre-configured to deploy the Express server as a serverless function:

```bash
cd server
vercel deploy
```

### Frontend (Vercel Static)

```bash
cd client/vite-project
npm run build
vercel deploy
```

> **Note:** Update the `VITE_BACKEND_URL` environment variable in your frontend deployment to point to your deployed backend URL.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feature/awesome-feature`
3. **Commit** your changes — `git commit -m "Add awesome feature"`
4. **Push** to the branch — `git push origin feature/awesome-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

<div align="center">

**Built with ❤️ by [Jagdish Uikey](https://github.com/Jagdishuikey)**

⭐ Star this repo if you found it helpful!

</div>
