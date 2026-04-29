"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TablePromptProps {
  onGenerate: (rows: number, cols: number) => void;
  onCancel: () => void;
}

export default function TablePromptModal({ onGenerate, onCancel }: TablePromptProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Generate Table</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Rows</label>
              <input type="number" min="1" max="20" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg text-center" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-600 mb-1">Columns</label>
              <input type="number" min="1" max="10" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg text-center" />
            </div>
          </div>
          <button 
            onClick={() => onGenerate(rows, cols)} 
            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
