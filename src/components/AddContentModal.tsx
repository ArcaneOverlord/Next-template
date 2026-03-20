"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AddContentModalProps {
  onClose: () => void;
}

export default function AddContentModal({ onClose }: AddContentModalProps) {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [days, setDays] = useState('');

  const handleFetchOptimalTime = () => {
    setDays('21'); 
    setStep(2);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">Add New Topic</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
        </div>
        
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">What do you want to master?</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., JavaScript Fundamentals" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white placeholder-gray-400" 
              />
              <button 
                onClick={handleFetchOptimalTime}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-800 transition flex justify-center items-center"
              >
                Calculate Optimal Study Time
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <p className="text-sm text-blue-800">AI Suggests an optimal timeline of:</p>
                <div className="flex items-center space-x-2 mt-2">
                  <input 
                    type="number" 
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-20 p-2 border border-gray-300 rounded-md font-bold text-center text-gray-900 bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600 font-medium">Days</span>
                </div>
              </div>
              <button 
                onClick={() => { alert('Ready to fetch curriculum!'); onClose(); }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Confirm & Generate Curriculum
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
