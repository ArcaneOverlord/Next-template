"use client";

import React from 'react';
import { Play } from 'lucide-react';

export default function Dashboard() {
  return (
    <>
      {/* Motivational Header */}
      <div className="relative w-full h-64 bg-gray-900 rounded-2xl overflow-hidden shadow-md flex flex-col justify-end p-6">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80')" }}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-9xl font-black text-white opacity-5 select-none tracking-tighter">STUDENT</span>
        </div>
        <div className="relative z-10">
          <p className="text-white text-xl md:text-2xl font-medium italic leading-snug drop-shadow-md">
            &quot;The expert in anything was once a beginner.&quot;
          </p>
          <p className="text-blue-300 mt-2 font-semibold text-sm tracking-wide">— Aristotle</p>
        </div>
      </div>

      {/* Study Progress */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Current Course</h3>
            <p className="text-lg font-bold text-gray-800">JavaScript Basics</p>
          </div>
          <span className="text-blue-600 font-bold text-xl">45%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
        </div>
      </div>

      {/* Study Now Button */}
      <button className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between">
        <div className="text-left relative z-10">
          <span className="block text-blue-200 text-sm font-semibold mb-1 uppercase tracking-wider">Day 14 Portion</span>
          <span className="block text-2xl font-bold">Functions & Scope</span>
        </div>
        <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform relative z-10">
          <Play fill="currentColor" size={28} />
        </div>
      </button>
    </>
  );
}
