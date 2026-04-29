"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Heading1, Heading2, Image as ImageIcon, Video, Trash2, Search, MoreVertical, Share2, Globe, Save } from 'lucide-react';

interface BookEditorProps {
  bookId: string;
  bookName: string;
}

export type BlockType = 'h1' | 'h2' | 'text' | 'image' | 'video';

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string; 
  size?: 'small' | 'medium' | 'large' | 'full'; 
}

export default function BookEditor({ bookId, bookName }: BookEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    { id: '1', type: 'h1', content: bookName },
    { id: '2', type: 'text', content: 'This is your first note. Click Edit to start making changes.' }
  ]);

  const [showBlockMenu, setShowBlockMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- BLOCK ACTIONS ---
  const addBlock = (index: number, type: BlockType) => {
    const newBlock: NoteBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      size: 'medium'
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setShowBlockMenu(null);
  };

  const updateBlock = (id: string, newContent: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  const updateMediaSize = (id: string, size: NoteBlock['size']) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, size } : b));
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  const filteredBlocks = blocks.filter(block => 
    block.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Top Toolbar */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between bg-gray-50 rounded-t-2xl gap-4 z-20">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search in note..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              {/* Add Block Button (Global add at the bottom equivalent) */}
              <button 
                onClick={() => addBlock(blocks.length - 1, 'text')} 
                className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition text-sm"
              >
                <Plus size={16} className="mr-1" /> Add
              </button>
              {/* Save Button */}
              <button 
                onClick={() => setIsEditing(false)} 
                className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition text-sm shadow-sm"
              >
                <Save size={16} className="mr-2" /> Save
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold transition text-sm"
            >
              Edit
            </button>
          )}

          {/* 3-Dot Circular Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition focus:outline-none"
            >
              <MoreVertical size={20} />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 animate-fade-in">
                <button 
                  onClick={() => { alert('Opening Share Options...'); setIsMenuOpen(false); }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  <Share2 size={16} className="mr-3" /> Share
                </button>
                <button 
                  onClick={() => { alert('Publishing Book...'); setIsMenuOpen(false); }}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                >
                  <Globe size={16} className="mr-3" /> Publish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto p-8 lg:px-24">
        {filteredBlocks.map((block, index) => (
          <div key={block.id} className="relative group mb-2">
            
            {/* === READ-ONLY VIEW === */}
            {!isEditing ? (
              <div className="py-1">
                {block.type === 'h1' && <h1 className="w-full text-4xl font-bold text-gray-900 py-3">{block.content || 'Untitled'}</h1>}
                {block.type === 'h2' && <h2 className="w-full text-2xl font-bold text-gray-800 py-2 mt-4">{block.content}</h2>}
                {block.type === 'text' && <div className="w-full text-lg text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[1.5rem]">{block.content}</div>}
                
                {(block.type === 'image' || block.type === 'video') && block.content && (
                  <div className={`my-4 flex ${block.size === 'small' ? 'w-1/3' : block.size === 'medium' ? 'w-1/2' : block.size === 'large' ? 'w-3/4' : 'w-full'}`}>
                    {block.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={block.content} alt="Book media" className="rounded-lg max-h-96 object-contain" />
                    ) : (
                      <div className="w-full bg-black rounded-lg aspect-video flex items-center justify-center text-white text-xs">Video Player: {block.content}</div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              
              /* === EDIT MODE VIEW === */
              <>
                {block.type === 'h1' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, e.target.value)}
                    placeholder="Heading 1"
                    className="w-full text-4xl font-bold text-gray-900 border-none outline-none bg-transparent py-3 placeholder-gray-300"
                  />
                )}

                {block.type === 'h2' && (
                  <input
                    type="text"
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, e.target.value)}
                    placeholder="Subheading"
                    className="w-full text-2xl font-bold text-gray-800 border-none outline-none bg-transparent py-2 mt-4 placeholder-gray-300"
                  />
                )}

                {block.type === 'text' && (
                  <textarea
                    value={block.content}
                    onChange={(e) => updateBlock(block.id, e.target.value)}
                    placeholder="Type here..."
                    rows={Math.max(1, block.content.split('\n').length)}
                    className="w-full text-lg text-gray-700 leading-relaxed border-none outline-none bg-transparent resize-none overflow-hidden py-1 placeholder-gray-300 focus:ring-0"
                  />
                )}

                {(block.type === 'image' || block.type === 'video') && (
                  <div className={`relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 my-4 flex flex-col items-center justify-center transition-all ${
                    block.size === 'small' ? 'w-1/3' : block.size === 'medium' ? 'w-1/2' : block.size === 'large' ? 'w-3/4' : 'w-full'
                  }`}>
                    {block.content ? (
                      block.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={block.content} alt="Block media" className="rounded-lg max-h-96 object-contain opacity-50" />
                      ) : (
                        <div className="w-full bg-black rounded-lg aspect-video flex items-center justify-center text-white text-xs opacity-50">Video Player (URL: {block.content})</div>
                      )
                    ) : (
                      <>
                        {block.type === 'image' ? <ImageIcon size={32} className="text-gray-400 mb-2" /> : <Video size={32} className="text-gray-400 mb-2" />}
                      </>
                    )}
                    <input 
                      type="text" 
                      value={block.content}
                      placeholder={`Paste ${block.type} URL here...`}
                      className="w-full max-w-sm text-center text-sm border-b border-gray-400 bg-transparent outline-none focus:border-blue-600 py-1 mt-2 font-medium"
                      onChange={(e) => updateBlock(block.id, e.target.value)}
                    />
                    
                    {/* Media Resizer Controls */}
                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm rounded-md p-1 border">
                      {['small', 'medium', 'large', 'full'].map((s) => (
                        <button key={s} onClick={() => updateMediaSize(block.id, s as NoteBlock['size'])} className={`w-6 h-6 text-xs font-bold rounded ${block.size === s ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                          {s.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Edit Mode: Hover Controls (Plus / Trash) */}
                {!searchQuery && (
                  <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button onClick={() => setShowBlockMenu(showBlockMenu === index ? null : index)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                      <Plus size={18} />
                    </button>
                    <button onClick={() => removeBlock(block.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}

                {/* Edit Mode: Add Block Menu */}
                {showBlockMenu === index && (
                  <div className="absolute -left-4 top-10 z-30 bg-white border border-gray-200 shadow-xl rounded-xl p-2 flex space-x-2 animate-fade-in">
                    <button onClick={() => addBlock(index, 'h1')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Heading 1"><Heading1 size={18} /></button>
                    <button onClick={() => addBlock(index, 'h2')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Subheading"><Heading2 size={18} /></button>
                    <button onClick={() => addBlock(index, 'text')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Text"><Type size={18} /></button>
                    <div className="w-px bg-gray-200 my-1"></div>
                    <button onClick={() => addBlock(index, 'image')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Image"><ImageIcon size={18} /></button>
                    <button onClick={() => addBlock(index, 'video')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Video"><Video size={18} /></button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Empty State */}
        {blocks.length === 0 && isEditing && (
          <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl mt-4">
            Start typing or use the Add button above...
          </div>
        )}
      </div>
    </div>
  );
}
