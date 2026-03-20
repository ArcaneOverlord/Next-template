"use client";

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginPanelProps {
  onLoginSuccess: (isFirstTime: boolean) => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // --- CUSTOM VALIDATION LOGIC ---
  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!isLoginMode) {
      if (fullName.trim().length < 2) {
        setError("Please enter your full name.");
        return false;
      }
      // Custom Password Rules: Min 8 chars, 1 number, 1 special character
      const passRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
      if (!passRegex.test(password)) {
        setError("Password must be at least 8 characters, include a number, and a special character (!@#$%).");
        return false;
      }
    }
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!validateInputs()) return;

    setLoading(true);

    try {
      if (isLoginMode) {
        // --- STANDARD LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes("Email not confirmed")) {
            setError("Please verify your email first.");
            // Optionally, you could trigger a resend OTP here
          } else {
            throw error;
          }
        } else {
          onLoginSuccess(false);
        }
      } else {
        // --- SIGN UP & TRIGGER OTP ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        
        if (error) throw error;
        
        // If successful, switch UI to ask for the code
        setSuccessMsg("Account created! Check your email for the 6-digit verification code.");
        setShowOtpInput(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // --- VERIFY THE OTP CODE ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup',
      });

      if (error) throw error;
      
      // Verification successful, they are now logged in
      onLoginSuccess(true);
      
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        
        {!showOtpInput ? (
          <>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-gray-500 mb-6 text-sm">
              {isLoginMode ? 'Enter your details to study.' : 'Start your learning journey today.'}
            </p>

            {error && <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLoginMode && (
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50" />
              )}
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50" />
              
              <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? 'Processing...' : (isLoginMode ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-2">
              <div className="h-px bg-gray-300 w-full"></div>
              <span className="text-gray-400 text-sm">OR</span>
              <div className="h-px bg-gray-300 w-full"></div>
            </div>

            <button onClick={handleGoogleLogin} className="w-full mt-6 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
              Sign in with Google
            </button>

            <p className="mt-8 text-center text-sm text-gray-600">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} className="text-blue-600 font-bold hover:underline">
                {isLoginMode ? 'Create account' : 'Log in'}
              </button>
            </p>
          </>
        ) : (
          /* --- OTP VERIFICATION UI --- */
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Check Your Email</h2>
            <p className="text-gray-500 mb-6 text-sm">{successMsg}</p>
            
            {error && <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg text-sm mb-4 text-center">{error}</div>}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input 
                type="text" 
                maxLength={6}
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                placeholder="Enter 6-digit code" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 text-center text-2xl tracking-widest font-bold" 
              />
              <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </form>
            
            <button onClick={() => setShowOtpInput(false)} className="mt-6 text-gray-500 text-sm hover:underline">
              ← Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
