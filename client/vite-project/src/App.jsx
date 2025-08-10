import React, { useContext } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import assets from './assets/assets.js'
import { Toaster } from 'react-hot-toast'
import { AuthContext } from '../context/AuthContext.jsx'
import axios from 'axios'




const App = () => {
  const {authUser}=useContext(AuthContext)
  console.log("authUser in App.jsx:", authUser);
  return (
    <div className="bg-[url('./src/assets/bgImage.svg')] bg-contain">
      <Toaster/>
              <Routes>
          <Route path='/' element={authUser?<HomePage/> : <Navigate to="/login"/>}/>
          <Route path='/login' element={!authUser ? <Login/>: <Navigate to = "/"/>}/>
          <Route path='/signup' element={!authUser?<Signup/>:<Navigate to= "/"/>}/>
          <Route path='/profile' element={authUser?<Profile/>:<Navigate to="/login"/>}/>
        </Routes>
    </div>
  )
}

export default App
