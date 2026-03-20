"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from '../components/layout/Dashboard'; // Note: Ensure you move Dashboard to the layout folder!
import LibraryBrowser from '../components/library/LibraryBrowser';
import AddContentModal from '../components/AddContentModal';
import { Menu } from 'lucide-react';

export default function StudyApp() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // NEW: State to track which page we are on
  const [currentPage, setCurrentPage] = useState('home'); 
  // NEW: State to track if a book is actively being edited
  const [activeBook, setActiveBook] = useState<{id: string, name: string} | null>(null);

  const userName = "Test User";
  const userEmail = "test@example.com";

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('has_seen_onboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const closeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('has_seen_onboarding', 'true');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setActiveBook(null); // Close any open book when navigating via sidebar
  };

  const handleOpenBook = (bookId: string, bookName: string) => {
    setActiveBook({ id: bookId, name: bookName });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 text-center shadow-2xl relative">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome&comma; {userName}!</h2>
            <p className="text-gray-600 mb-6">Let&apos;s build your Library.</p>
            <button onClick={() => { closeOnboarding(); handleNavigate('library'); }} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition mb-4">
              Go to Library
            </button>
          </div>
        </div>
      )}

      {isDrawerOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => setIsDrawerOpen(false)} />}

      <Sidebar 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        userName={userName}
        userEmail={userEmail}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto">
        <header className="bg-white px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center">
            <button onClick={() => setIsDrawerOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Menu size={24} />
            </button>
            <h1 className="ml-4 text-xl font-bold text-gray-800 capitalize">
              {activeBook ? activeBook.name : currentPage}
            </h1>
          </div>
        </header>

        <main className="p-4 max-w-4xl mx-auto w-full space-y-6">
          {/* Conditional Rendering based on current state */}
          {activeBook ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[600px] flex items-center justify-center text-gray-400">
              Book Editor will load here for: {activeBook.name}
            </div>
          ) : currentPage === 'library' ? (
            <LibraryBrowser onOpenBook={handleOpenBook} />
          ) : (
            <Dashboard onOpenAdd={() => setIsAddModalOpen(true)} />
          )}
        </main>
      </div>

      {isAddModalOpen && <AddContentModal onClose={() => setIsAddModalOpen(false)} />}
    </div>
  );
}
