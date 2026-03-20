"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, BookOpen, Trash2, RefreshCcw, HelpCircle, Award, Settings, Key, LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdd: () => void;
  userName: string;
  userEmail: string;
}

export default function Sidebar({ isOpen, onClose, onOpenAdd, userName, userEmail }: SidebarProps) {
  const [apiKey, setApiKey] = useState('');

  // Load saved key on mount
  useEffect(() => {
    const saved = localStorage.getItem('custom_ai_api_key');
    if (saved) setApiKey(saved);
  }, []);

  const saveApiKey = (val: string) => {
    setApiKey(val);
    localStorage.setItem('custom_ai_api_key', val);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const menuItems = [
    { icon: <BookOpen size={20} />, label: 'Add Content', action: () => { onClose(); onOpenAdd(); } },
    { icon: <Trash2 size={20} />, label: 'Remove Content', action: () => {} },
    { icon: <RefreshCcw size={20} />, label: 'Revise', action: () => {} },
    { icon: <HelpCircle size={20} />, label: 'Quiz', action: () => {} },
    { icon: <Award size={20} />, label: 'Challenges', action: () => {} },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
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
      
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, idx) => (
          <button key={idx} onClick={item.action} className="w-full flex items-center space-x-4 px-6 py-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t bg-gray-50 space-y-4">
        <div>
          <label className="flex items-center space-x-2 text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
            <Key size={14} /> <span>Custom AI API Key</span>
          </label>
          <input 
            type="password" 
            value={apiKey}
            onChange={(e) => saveApiKey(e.target.value)}
            placeholder="Paste Gemini/OpenAI key..." 
            className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900 bg-white focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition font-bold text-sm">
          <LogOut size={16} /> <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
