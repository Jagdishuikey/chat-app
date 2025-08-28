import React, { useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';


  const handleLogin = async () => {
    try {
      const res = await axios.post("https://chat-app-backend-pi-gilt.vercel.app/api/auth/login", { email, password });
      
      if (res.data.success) {
        localStorage.setItem("token", res.data.token); // store token
        navigate("/"); // redirect to home
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const {login} = useContext(AuthContext)

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    const success = await login('login', formData); // Pass 'login' as state and formData as credentials
    if (success) {
      console.log("Success")
      navigate('/');
    }
  };


    

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4'>
      <div className='w-full max-w-6xl flex items-center justify-center gap-8 lg:gap-16'>
        
        {/* Left Section - Logo */}
        <div className='hidden lg:flex flex-col items-center justify-center flex-1'>
          <img src={assets.Chillchat} alt="ChillChat Logo" className='w-80 mb-8' />
          <h1 className='text-4xl font-bold text-white mb-4 text-center'>
            Welcome to ChillChat
          </h1>
          <p className='text-xl text-gray-300 text-center max-w-md'>
            Connect with friends and family in a relaxed, secure environment
          </p>
        </div>

        {/* Right Section - Login Box */}
        <div className='w-full max-w-sm'>
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20'>
            
            {/* Mobile Logo */}
            <div className='lg:hidden flex justify-center mb-8'>
              <img src={assets.Chillchat} alt="ChillChat Logo" className='w-48' />
            </div>

            {/* Login Header */}
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-white mb-1'>
                Welcome Back
              </h2>
              <p className='text-gray-300 text-sm'>
                Sign in to your account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-2'>
                  Email Address
                </label>
                <div className='relative'>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200'
                    placeholder='Enter your email'
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className='block text-sm font-medium text-gray-300 mb-2'>
                  Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className='w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200'
                    placeholder='Enter your password'
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors'
                  >
                    {showPassword ? (
                      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21' />
                      </svg>
                    ) : (
                      <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className='flex items-center justify-between'>
                <label className='flex items-center'>
                  <input
                    type="checkbox"
                    className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded bg-white/10 border-white/20'
                  />
                  <span className='ml-2 text-sm text-gray-300'>
                    Remember me
                  </span>
                </label>
                <a href="#" className='text-sm text-purple-400 hover:text-purple-300 transition-colors'>
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105'
              >
                Sign In
              </button>



              {/* Sign Up Link */}
              <div className='text-center mt-4'>
                <span className='text-gray-300'>
                  Don't have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className='text-purple-400 hover:text-purple-300 font-medium transition-colors'
                >
                  Sign up
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
