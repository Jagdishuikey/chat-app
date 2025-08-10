import React, { useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useContext(AuthContext);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Remove confirmPassword from the data sent to API
      const { confirmPassword, ...signupData } = formData;
      console.log('Signup attempt:', signupData);
      const success = await login('signup', signupData);
      if (success) {
        navigate('/');
      }
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4'>
      <div className='w-full max-w-6xl flex items-center justify-center gap-8 lg:gap-16'>
        
        {/* Left Section - Logo */}
        <div className='hidden lg:flex flex-col items-center justify-center flex-1'>
          <img src={assets.Chillchat} alt="ChillChat Logo" className='w-80 mb-8' />
          <h1 className='text-4xl font-bold text-white mb-4 text-center'>
            Join ChillChat
          </h1>
          <p className='text-xl text-gray-300 text-center max-w-md'>
            Create your account and start connecting with friends and family
          </p>
        </div>

        {/* Right Section - Signup Box */}
        <div className='w-full max-w-sm'>
          <div className='bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20'>
            
            {/* Mobile Logo */}
            <div className='lg:hidden flex justify-center mb-6'>
              <img src={assets.Chillchat} alt="ChillChat Logo" className='w-48' />
            </div>

            {/* Signup Header */}
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-white mb-1'>
                Create Account
              </h2>
              <p className='text-gray-300 text-sm'>
                Sign up to get started
              </p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className='block text-sm font-medium text-gray-300 mb-2'>
                  Full Name
                </label>
                <div className='relative'>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.fullName ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder='Enter your full name'
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                    </svg>
                  </div>
                </div>
                {errors.fullName && (
                  <p className='text-red-400 text-xs mt-1'>{errors.fullName}</p>
                )}
              </div>

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
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder='Enter your email'
                  />
                  <div className='absolute inset-y-0 right-0 pr-3 flex items-center'>
                    <svg className='h-5 w-5 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' />
                    </svg>
                  </div>
                </div>
                {errors.email && (
                  <p className='text-red-400 text-xs mt-1'>{errors.email}</p>
                )}
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
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.password ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder='Create a password'
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
                {errors.password && (
                  <p className='text-red-400 text-xs mt-1'>{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className='block text-sm font-medium text-gray-300 mb-2'>
                  Confirm Password
                </label>
                <div className='relative'>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-400' : 'border-white/20'
                    }`}
                    placeholder='Confirm your password'
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors'
                  >
                    {showConfirmPassword ? (
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
                {errors.confirmPassword && (
                  <p className='text-red-400 text-xs mt-1'>{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className='flex items-start'>
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className='h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded bg-white/10 border-white/20 mt-1'
                />
                <label htmlFor="terms" className='ml-2 text-sm text-gray-300'>
                  I agree to the{' '}
                  <a href="#" className='text-purple-400 hover:text-purple-300 transition-colors'>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className='text-purple-400 hover:text-purple-300 transition-colors'>
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Signup Button */}
              <button
                type="submit"
                className='w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:scale-105'
              >
                Create Account
              </button>

              {/* Sign In Link */}
              <div className='text-center mt-4'>
                <span className='text-gray-300'>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className='text-purple-400 hover:text-purple-300 font-medium transition-colors'
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup; 