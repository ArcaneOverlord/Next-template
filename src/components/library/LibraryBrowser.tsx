"use client";

import React, { useState } from 'react';
import { Folder, Book, Plus, ChevronRight, MoreVertical } from 'lucide-react';

interface PathItem {
  id: string;
  name: string;
  type: 'root' | 'section' | 'rack' | 'shelf';
}

interface LibraryItem {
  id: string;
  parentId: string;
  name: string;
  type: 'section' | 'rack' | 'shelf' | 'book';
}

interface LibraryBrowserProps {
  onOpenBook: (bookId: string, bookName: string) => void;
}

export default function LibraryBrowser({ onOpenBook }: LibraryBrowserProps) {
  // The breadcrumb path, starting at the root
  const [path, setPath] = useState<PathItem[]>([{ id: 'root', name: 'Library', type: 'root' }]);
  
  // Mock Database for our items
  const [items, setItems] = useState<LibraryItem[]>([
    { id: 'sec1', parentId: 'root', name: 'Computer Science', type: 'section' },
    { id: 'sec2', parentId: 'root', name: 'History', type: 'section' },
    { id: 'rack1', parentId: 'sec1', name: 'Web Development', type: 'rack' },
    { id: 'shelf1', parentId: 'rack1', name: 'Frontend', type: 'shelf' },
    { id: 'book1', parentId: 'shelf1', name: 'React Fundamentals', type: 'book' },
  ]);

  const currentLevel = path[path.length - 1];
  
  // Filter items to only show what belongs in the current folder
  const currentItems = items.filter(item => item.parentId === currentLevel.id);

  // Determine what type of item we should create next based on where we are
  const getNextItemType = () => {
    switch (currentLevel.type) {
      case 'root': return 'section';
      case 'section': return 'rack';
      case 'rack': return 'shelf';
      case 'shelf': return 'book';
      default: return 'section';
    }
  };

  const handleNavigate = (item: LibraryItem) => {
    if (item.type === 'book') {
      onOpenBook(item.id, item.name);
    } else {
      setPath([...path, { id: item.id, name: item.name, type: item.type as any }]);
    }
  };

  const handleNavigateUp = (index: number) => {
    setPath(path.slice(0, index + 1));
  };

  const handleCreate = () => {
    const nextType = getNextItemType();
    const name = prompt(`Enter name for new ${nextType}:`);
    if (name) {
      const newItem: LibraryItem = {
        id: Math.random().toString(36).substr(2, 9),
        parentId: currentLevel.id,
        name,
        type: nextType,
      };
      setItems([...items, newItem]);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px] flex flex-col">
      
      {/* Breadcrumb Navigation Path */}
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8 overflow-x-auto pb-2 whitespace-nowrap">
        {path.map((step, index) => (
          <React.Fragment key={step.id}>
            <button 
              onClick={() => handleNavigateUp(index)}
              className={`hover:text-blue-600 transition font-medium ${index === path.length - 1 ? 'text-gray-900 font-bold' : ''}`}
            >
              {step.name}
            </button>
            {index < path.length - 1 && <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Grid of Folders / Books */}
      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 align-top place-content-start">
        {currentItems.map(item => (
          <div 
            key={item.id} 
            onClick={() => handleNavigate(item)}
            className="group relative bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all h-32 shadow-sm hover:shadow-md"
          >
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={16} />
            </button>
            
            {item.type === 'book' ? (
              <Book size={40} className="text-indigo-500 mb-2" />
            ) : (
              <Folder size={40} className="text-blue-500 mb-2" />
            )}
            
            <span className="text-sm font-semibold text-gray-800 line-clamp-2 w-full">{item.name}</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{item.type}</span>
          </div>
        ))}

        {/* Create New Item Button */}
        <div 
          onClick={handleCreate}
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all h-32 group"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-2 transition-colors">
            <Plus size={24} className="text-gray-400 group-hover:text-blue-500" />
          </div>
          <span className="text-sm font-semibold text-gray-500 group-hover:text-blue-600">
            Add {getNextItemType()}
          </span>
        </div>
      </div>
    </div>
  );
}
