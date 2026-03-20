"use client";

import React, { useState } from 'react';
import LoginPanel from '../components/LoginPanel';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import AddContentModal from '../components/AddContentModal';
import { Menu } from 'lucide-react';

export default function StudyApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New state to track if we should show the initial onboarding popup
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleLogin = (isFirstTime: boolean) => {
    setIsLoggedIn(true);
    if (isFirstTime) {
      setShowOnboarding(true);
    }
  };

  if (!isLoggedIn) {
    return <LoginPanel onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Onboarding Modal for First Time Users */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome!</h2>
            <p className="text-gray-600 mb-6">What is the first topic you want to master?</p>
            <input type="text" placeholder="e.g., JavaScript, History, etc." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-gray-50 mb-4" />
            <button onClick={() => { setShowOnboarding(false); setIsAddModalOpen(true); }} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mb-4">
              Start Learning
            </button>
            <button onClick={() => setShowOnboarding(false)} className="text-gray-500 font-medium hover:text-gray-800 transition">
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <Sidebar 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onOpenAdd={() => setIsAddModalOpen(true)} 
      />

      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto">
        <header className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-30">
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-bold text-gray-800">Dashboard</h1>
        </header>

        <main className="p-4 max-w-4xl mx-auto w-full space-y-6">
          <Dashboard onOpenAdd={() => setIsAddModalOpen(true)} />
        </main>
      </div>

      {isAddModalOpen && <AddContentModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
