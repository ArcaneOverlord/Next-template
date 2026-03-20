"use client";

import React, { useState, useEffect } from 'react';
import { Play, Plus } from 'lucide-react';

interface DashboardProps {
  onOpenAdd: () => void;
}

export default function Dashboard({ onOpenAdd }: DashboardProps) {
  const [activeCourses, setActiveCourses] = useState<any[]>([]); 
  const [isLoadingQuote, setIsLoadingQuote] = useState(true);
  
  const [quoteData, setQuoteData] = useState({
    text: "",
    author: "",
    imageUrl: ""
  });

  useEffect(() => {
    setTimeout(() => {
      setQuoteData({
        text: "I have no special talent. I am only passionately curious.",
        author: "Albert Einstein",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Albert_Einstein_Head.jpg"
      });
      setIsLoadingQuote(false);
    }, 2000);
  }, []);

  return (
    <>
      <div className="relative w-full h-80 bg-gray-900 rounded-2xl overflow-hidden shadow-md flex flex-col justify-end p-6">
        {isLoadingQuote ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-blue-300 font-medium text-sm tracking-widest uppercase">Fetching Inspiration...</p>
          </div>
        ) : (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay transition-opacity duration-1000"
              style={{ backgroundImage: `url('${quoteData.imageUrl}')` }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <span className="text-7xl md:text-9xl font-black text-white opacity-5 select-none tracking-tighter uppercase whitespace-nowrap">
                {quoteData.author.split(' ')[0]}
              </span>
            </div>
            <div className="relative z-10 animate-fade-in">
              <p className="text-white text-xl md:text-3xl font-medium italic leading-snug drop-shadow-lg">
                &quot;{quoteData.text}&quot;
              </p>
              <p className="text-blue-300 mt-3 font-bold text-base tracking-wide drop-shadow-md">— {quoteData.author}</p>
            </div>
          </>
        )}
      </div>

      {activeCourses.length > 0 ? (
        <>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">Current Course</h3>
                <p className="text-lg font-bold text-gray-800">{activeCourses[0].title}</p>
              </div>
              <span className="text-blue-600 font-bold text-xl">45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <button className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between">
            <div className="text-left relative z-10">
              <span className="block text-blue-200 text-sm font-semibold mb-1 uppercase tracking-wider">Today&apos;s Portion</span>
              <span className="block text-2xl font-bold">Continue Learning</span>
            </div>
            <div className="bg-white/20 p-4 rounded-full group-hover:scale-110 transition-transform relative z-10">
              <Play fill="currentColor" size={28} />
            </div>
          </button>
        </>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-500">
            <Plus size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Your desk is empty!</h3>
          <p className="text-gray-500 mb-6">You haven&apos;t added any study topics yet.</p>
          <button onClick={onOpenAdd} className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition shadow-md">
            Add New Topic
          </button>
        </div>
      )}
    </>
  );
}
