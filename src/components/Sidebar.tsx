"use client";

import React from 'react';
import { X, BookOpen, Trash2, RefreshCcw, HelpCircle, Award, Settings } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdd: () => void;
}

export default function Sidebar({ isOpen, onClose, onOpenAdd }: SidebarProps) {
  const menuItems = [
    { icon: <BookOpen size={20} />, label: 'Add Content', action: () => { onClose(); onOpenAdd(); } },
    { icon: <Trash2 size={20} />, label: 'Remove Content', action: () => {} },
    { icon: <RefreshCcw size={20} />, label: 'Revise', action: () => {} },
    { icon: <HelpCircle size={20} />, label: 'Quiz', action: () => {} },
    { icon: <Award size={20} />, label: 'Challenges', action: () => {} },
    { icon: <Settings size={20} />, label: 'Settings', action: () => {} },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out flex flex-col`}>
      <div className="p-6 border-b flex justify-between items-center bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h3 className="font-bold text-gray-800">Student</h3>
            <p className="text-xs text-gray-500">Pro Member</p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        {menuItems.map((item, idx) => (
          <button key={idx} onClick={item.action} className="w-full flex items-center space-x-4 px-6 py-4 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
