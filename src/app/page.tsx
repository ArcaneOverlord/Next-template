"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/Dashboard';
import AddContentModal from '../components/AddContentModal';
import { Menu } from 'lucide-react';

export default function StudyApp() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // We use dummy user data to completely bypass login
  const userName = "Test User";
  const userEmail = "test@example.com";

  // Simulate showing the welcome screen on first load
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('has_seen_onboarding', 'true'); // Prevents it from popping up on every refresh
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {userName}!</h2>
            <p className="text-gray-600 mb-6">What is the first topic you want to master?</p>
            <button onClick={() => { closeOnboarding(); setIsAddModalOpen(true); }} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mb-4">
              Add a Topic
            </button>
            <button onClick={closeOnboarding} className="text-gray-500 font-medium hover:text-gray-800 transition">
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isDrawerOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />}

      <Sidebar 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        onOpenAdd={() => setIsAddModalOpen(true)}
        userName={userName}
        userEmail={userEmail}
      />

      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto">
        <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center">
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-800">Dashboard</h1>
          </div>
        </header>

        <main className="p-4 max-w-4xl mx-auto w-full space-y-6">
          <Dashboard onOpenAdd={() => setIsAddModalOpen(true)} />
        </main>
      </div>

      {isAddModalOpen && <AddContentModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
