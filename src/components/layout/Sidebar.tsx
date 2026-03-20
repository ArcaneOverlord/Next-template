"use client";

import React, { useState } from 'react';
import { X, Home, Library, RefreshCcw, HelpCircle, Award, Settings, Cpu, LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  onNavigate: (page: string) => void; // Function to switch between Home/Library/etc.
}

export default function Sidebar({ isOpen, onClose, userName, userEmail, onNavigate }: SidebarProps) {
  const [useCustomAi, setUseCustomAi] = useState(false);

  const menuItems = [
    { icon: <Home size={20} />, label: 'Home', action: 'home' },
    { icon: <Library size={20} />, label: 'Library', action: 'library' },
    { icon: <RefreshCcw size={20} />, label: 'Revise', action: 'revise' },
    { icon: <HelpCircle size={20} />, label: 'Quiz', action: 'quiz' },
    { icon: <Award size={20} />, label: 'Challenges', action: 'challenges' },
    { icon: <Settings size={20} />, label: 'Settings', action: 'settings' },
  ];

  const handleNavigation = (action: string) => {
    onNavigate(action);
    onClose();
  };

  return (
    <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
      {/* Profile Header */}
      <div className="p-6 border-b flex justify-between items-center bg-gray-50">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <h3 className="font-bold text-gray-800 truncate">{userName}</h3>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0"><X size={24} /></button>
      </div>
      
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, idx) => (
          <button 
            key={idx} 
            onClick={() => handleNavigation(item.action)} 
            className="w-full flex items-center space-x-4 px-6 py-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Footer Settings & Logout */}
      <div className="p-4 border-t bg-gray-50 space-y-4">
        {/* AI API Switch Toggle */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2 text-sm font-bold text-gray-600">
            <Cpu size={16} /> <span>Custom AI API</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={useCustomAi}
              onChange={() => setUseCustomAi(!useCustomAi)}
            />
            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        <button className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-red-100 hover:text-red-600 transition font-bold text-sm">
          <LogOut size={16} /> <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
