"use client";

import React, { useState } from 'react';

interface LoginPanelProps {
  onLogin: (isFirstTime: boolean) => void;
}

export default function LoginPanel({ onLogin }: LoginPanelProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Mock function to simulate login/signup
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // If they are signing up, we pass 'true' to trigger the onboarding modal
    onLogin(!isLoginMode); 
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {isLoginMode ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">
          {isLoginMode ? 'Enter your details to study.' : 'Start your learning journey today.'}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLoginMode && (
            <>
              {/* Profile Pic Upload Mock */}
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-xs text-center cursor-pointer hover:bg-gray-300 transition">
                  Upload<br/>Photo
                </div>
              </div>
              <input type="text" required placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 placeholder-gray-400" />
            </>
          )}

          <input type="text" required placeholder={isLoginMode ? "Email or Username" : "Username"} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 placeholder-gray-400" />
          
          {!isLoginMode && (
            <input type="email" required placeholder="Email Address" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 placeholder-gray-400" />
          )}

          <input type="password" required placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 placeholder-gray-400" />
          
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
            {isLoginMode ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-2">
          <div className="h-px bg-gray-300 w-full"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px bg-gray-300 w-full"></div>
        </div>

        <button className="w-full mt-6 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-600">
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-blue-600 font-bold hover:underline">
            {isLoginMode ? 'Create account' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
}
