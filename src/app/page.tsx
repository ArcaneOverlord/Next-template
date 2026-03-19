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

  if (!isLoggedIn) {
    return <LoginPanel onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
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
          <Dashboard />
        </main>
      </div>

      {isAddModalOpen && <AddContentModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
