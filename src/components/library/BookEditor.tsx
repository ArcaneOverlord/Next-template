"use client";

import React, { useState } from 'react';
import { Plus, Type, Heading1, Heading2, Image as ImageIcon, Video, Trash2, Search, Sparkles, Download } from 'lucide-react';

interface BookEditorProps {
  bookId: string;
  bookName: string;
}

// Our core block structure
export type BlockType = 'h1' | 'h2' | 'text' | 'image' | 'video';

export interface NoteBlock {
  id: string;
  type: BlockType;
  content: string; // Text content or URL for media
  size?: 'small' | 'medium' | 'large' | 'full'; // For media resizing
}

export default function BookEditor({ bookId, bookName }: BookEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initial state with a default empty text block
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    { id: '1', type: 'h1', content: bookName },
    { id: '2', type: 'text', content: '' }
  ]);

  const [showBlockMenu, setShowBlockMenu] = useState<number | null>(null);

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

  // --- SEARCH FILTER LOGIC ---
  const filteredBlocks = blocks.filter(block => 
    block.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Editor Toolbar */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between bg-gray-50 rounded-t-2xl gap-4">
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

        <div className="flex space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition text-sm font-bold">
            <Sparkles size={16} />
            <span>Add with AI</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-bold">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto p-8 lg:px-24">
        {filteredBlocks.map((block, index) => (
          <div key={block.id} className="relative group mb-2">
            
            {/* Block Content Based on Type */}
            {block.type === 'h1' && (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Heading 1"
                className="w-full text-4xl font-bold text-gray-900 border-none outline-none bg-transparent py-4 placeholder-gray-300"
              />
            )}

            {block.type === 'h2' && (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Subheading"
                className="w-full text-2xl font-bold text-gray-800 border-none outline-none bg-transparent py-3 mt-4 placeholder-gray-300"
              />
            )}

            {block.type === 'text' && (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Type here..."
                rows={Math.max(1, block.content.split('\n').length)}
                className="w-full text-lg text-gray-700 leading-relaxed border-none outline-none bg-transparent resize-none overflow-hidden py-1 placeholder-gray-300"
              />
            )}

            {(block.type === 'image' || block.type === 'video') && (
              <div className={`relative border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 my-4 flex flex-col items-center justify-center transition-all ${
                block.size === 'small' ? 'w-1/3' : block.size === 'medium' ? 'w-1/2' : block.size === 'large' ? 'w-3/4' : 'w-full'
              }`}>
                {block.content ? (
                  block.type === 'image' ? (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.content} alt="Block media" className="rounded-lg max-h-96 object-contain" />
                  ) : (
                    <div className="w-full bg-black rounded-lg aspect-video flex items-center justify-center text-white text-xs">Video Player (URL: {block.content})</div>
                  )
                ) : (
                  <>
                    {block.type === 'image' ? <ImageIcon size={32} className="text-gray-400 mb-2" /> : <Video size={32} className="text-gray-400 mb-2" />}
                    <input 
                      type="text" 
                      placeholder={`Paste ${block.type} URL here...`}
                      className="w-full max-w-sm text-center text-sm border-b border-gray-300 bg-transparent outline-none focus:border-blue-500 py-1"
                      onBlur={(e) => updateBlock(block.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && updateBlock(block.id, e.currentTarget.value)}
                    />
                  </>
                )}
                
                {/* Media Resizer Controls */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm rounded-md p-1 border">
                  {['small', 'medium', 'large', 'full'].map((s) => (
                    <button key={s} onClick={() => updateMediaSize(block.id, s as NoteBlock['size'])} className={`w-6 h-6 text-xs rounded ${block.size === s ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                      {s.charAt(0).toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Block Hover Controls (Left Side) */}
            {!searchQuery && ( // Hide controls while searching
              <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <button onClick={() => setShowBlockMenu(showBlockMenu === index ? null : index)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                  <Plus size={18} />
                </button>
                <button onClick={() => removeBlock(block.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                  <Trash2 size={18} />
                </button>
              </div>
            )}

            {/* The "Add Block" Popover Menu */}
            {showBlockMenu === index && (
              <div className="absolute -left-4 top-10 z-10 bg-white border border-gray-200 shadow-xl rounded-xl p-2 flex space-x-2 animate-fade-in">
                <button onClick={() => addBlock(index, 'h1')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Heading 1"><Heading1 size={18} /></button>
                <button onClick={() => addBlock(index, 'h2')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Subheading"><Heading2 size={18} /></button>
                <button onClick={() => addBlock(index, 'text')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Text"><Type size={18} /></button>
                <div className="w-px bg-gray-200 my-1"></div>
                <button onClick={() => addBlock(index, 'image')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Image"><ImageIcon size={18} /></button>
                <button onClick={() => addBlock(index, 'video')} className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded" title="Video"><Video size={18} /></button>
              </div>
            )}
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            Start typing or add a block with AI...
          </div>
        )}
      </div>
    </div>
  );
}
