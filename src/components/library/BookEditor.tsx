"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Image as ImageIcon, Grid, Trash2, Search, MoreVertical, Share2, Globe, Save, Move, X, ListTree, RefreshCcw } from 'lucide-react';

interface BookEditorProps {
  bookId: string;
  bookName: string;
}

export type BlockType = 'text' | 'media' | 'table';
export type ScrollMode = 'grow' | 'scroll';

export interface CanvasBlock {
  id: string;
  type: BlockType;
  content: string; 
  x: number;
  y: number;
  w: number;
  h: number | 'auto';
  scrollMode: ScrollMode;
}

export default function BookEditor({ bookId, bookName }: BookEditorProps) {
  // Modes: 'read' | 'edit' | 'transform'
  const [appMode, setAppMode] = useState<'read' | 'edit' | 'transform'>('read');
  
  // Search & UI
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showPowerLog, setShowPowerLog] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Blocks State
  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  
  // Transform State (for drag & drop)
  const [transformBackup, setTransformBackup] = useState<CanvasBlock[]>([]);
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Context Menu State (Right-click / Long-press)
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, blockId: string | null }>({ visible: false, x: 0, y: 0, blockId: null });

  // Close dropdowns if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setShowAddMenu(false);
      }
      if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  // --- ADD CONTENT ---
  const addBlock = (type: BlockType) => {
    const newBlock: CanvasBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'table' ? '[["",""],["",""]]' : '', // Basic 2x2 table JSON
      x: 20 + (blocks.length * 20), // Slight offset for new blocks
      y: 20 + (blocks.length * 20),
      w: type === 'media' ? 300 : 250,
      h: type === 'media' ? 200 : 'auto',
      scrollMode: 'grow'
    };
    setBlocks([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const updateBlockContent = (id: string, newContent: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  // --- TRANSFORM LOGIC (DRAGGING) ---
  const startTransform = () => {
    setTransformBackup(JSON.parse(JSON.stringify(blocks))); // Deep copy for discard
    setAppMode('transform');
  };

  const cancelTransform = () => {
    setBlocks(transformBackup);
    setAppMode('edit');
  };

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (appMode !== 'transform') return;
    if (e.button === 2) return; // Ignore right click for dragging
    
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const block = blocks.find(b => b.id === id);
    if (block) {
      setDraggingBlock(id);
      setDragOffset({
        x: e.clientX - rect.left - block.x,
        y: e.clientY - rect.top - block.y
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (appMode !== 'transform' || !draggingBlock) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    // Keep inside bounds roughly
    newX = Math.max(0, newX);
    newY = Math.max(0, newY);

    setBlocks(blocks.map(b => b.id === draggingBlock ? { ...b, x: newX, y: newY } : b));
  };

  const handlePointerUp = () => {
    setDraggingBlock(null);
  };

  // --- CONTEXT MENU LOGIC ---
  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    if (appMode !== 'transform') return;
    e.preventDefault();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    setContextMenu({ visible: true, x: clientX, y: clientY, blockId: id });
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    setContextMenu({ ...contextMenu, visible: false });
  };

  const toggleScrollMode = (id: string, currentMode: ScrollMode) => {
    const newMode = currentMode === 'grow' ? 'scroll' : 'grow';
    setBlocks(blocks.map(b => {
      if (b.id === id) {
        // If switching to scroll, freeze the current height. If grow, set to auto.
        const newHeight = newMode === 'scroll' ? 150 : 'auto'; 
        return { ...b, scrollMode: newMode, h: newHeight };
      }
      return b;
    }));
    setContextMenu({ ...contextMenu, visible: false });
  };

  const filteredBlocks = blocks.filter(block => 
    block.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between bg-gray-50 z-20">
        
        {/* Search Bar - FIXED TEXT COLOR */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search in note..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
          />
        </div>

        {/* Dynamic Right Actions */}
        <div className="flex items-center space-x-3" ref={menuRef}>
          
          {appMode === 'read' && (
            <>
              <button onClick={() => setAppMode('edit')} className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold transition text-sm">
                Edit
              </button>
              
              {/* 3-Dot Menu (Only in Read Mode) */}
              <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition focus:outline-none">
                  <MoreVertical size={20} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50">
                    <button onClick={() => { setShowPowerLog(true); setIsMenuOpen(false); }} className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <ListTree size={16} className="mr-3 text-indigo-500" /> Power Log
                    </button>
                    <button onClick={() => setIsMenuOpen(false)} className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <Share2 size={16} className="mr-3" /> Share
                    </button>
                    <button onClick={() => setIsMenuOpen(false)} className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                      <Globe size={16} className="mr-3" /> Publish
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {appMode === 'edit' && (
            <>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold transition text-sm">
                  <Plus size={16} className="mr-1" /> Add
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50">
                    <button onClick={() => addBlock('text')} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Type size={16} className="mr-2" /> Text Box</button>
                    <button onClick={() => addBlock('media')} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><ImageIcon size={16} className="mr-2" /> Media Box</button>
                    <button onClick={() => addBlock('table')} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Grid size={16} className="mr-2" /> Table Box</button>
                  </div>
                )}
              </div>

              <button onClick={startTransform} className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-bold transition text-sm">
                <Move size={16} className="mr-2" /> Transform
              </button>
              
              <button onClick={() => setAppMode('read')} className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition text-sm">
                <Save size={16} className="mr-2" /> Save
              </button>
            </>
          )}

          {appMode === 'transform' && (
            <>
              <button onClick={cancelTransform} className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold transition text-sm">
                <X size={16} className="mr-1" /> Discard
              </button>
              <button onClick={() => setAppMode('edit')} className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition text-sm">
                <Save size={16} className="mr-2" /> Save Layout
              </button>
            </>
          )}

        </div>
      </div>

      {/* Editor Canvas Area */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-auto p-4 ${appMode === 'transform' ? 'bg-gray-100' : 'bg-gray-50'}`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        
        {/* Empty States */}
        {blocks.length === 0 && appMode === 'read' && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
            This note is empty. Click Edit to start.
          </div>
        )}
        {blocks.length === 0 && appMode === 'edit' && (
          <div className="absolute inset-0 flex items-center justify-center text-blue-500 font-bold animate-pulse">
            Click Add above to add content!
          </div>
        )}

        {/* Render Blocks */}
        {filteredBlocks.map((block) => (
          <div 
            key={block.id} 
            className={`absolute rounded-lg border shadow-sm transition-shadow ${appMode === 'transform' ? 'cursor-move ring-2 ring-indigo-400 hover:ring-4 bg-white opacity-90' : 'border-gray-200 bg-white'}`}
            style={{
              left: `${block.x}px`,
              top: `${block.y}px`,
              width: `${block.w}px`,
              height: block.h === 'auto' ? 'auto' : `${block.h}px`,
              zIndex: draggingBlock === block.id ? 50 : 10,
              // CSS Resize only active in Transform mode
              resize: appMode === 'transform' ? 'both' : 'none',
              overflow: block.scrollMode === 'scroll' || appMode === 'transform' ? 'auto' : 'hidden',
            }}
            onPointerDown={(e) => handlePointerDown(e, block.id)}
            onContextMenu={(e) => handleContextMenu(e, block.id)}
            // Long press simulation for mobile
            onTouchStart={(e) => {
              if (appMode === 'transform') {
                const timer = setTimeout(() => handleContextMenu(e, block.id), 600);
                (e.target as any).dataset.timer = timer.toString();
              }
            }}
            onTouchEnd={(e) => clearTimeout(Number((e.target as any).dataset.timer))}
          >
            
            {/* Visual Indicator during Transform */}
            {appMode === 'transform' && (
              <div className="absolute inset-0 bg-indigo-500 bg-opacity-10 pointer-events-none flex items-center justify-center z-20">
                <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow">Box</span>
              </div>
            )}

            {/* Content Area - Pointer events disabled during transform so we can drag the whole box */}
            <div className={`p-3 w-full h-full ${appMode === 'transform' ? 'pointer-events-none' : ''}`}>
              
              {block.type === 'text' && (
                <textarea
                  readOnly={appMode === 'read' || appMode === 'transform'}
                  value={block.content}
                  onChange={(e) => updateBlockContent(block.id, e.target.value)}
                  placeholder="Type here..."
                  className={`w-full h-full resize-none border-none outline-none text-gray-800 bg-transparent ${appMode === 'read' ? 'cursor-default' : ''}`}
                  style={{ minHeight: '50px' }}
                />
              )}

              {block.type === 'media' && (
                <div className="w-full h-full flex flex-col">
                  {appMode === 'edit' && (
                    <input 
                      type="text" 
                      placeholder="Paste Image/Video URL"
                      value={block.content}
                      onChange={(e) => updateBlockContent(block.id, e.target.value)}
                      className="w-full text-xs p-1 mb-2 border-b border-gray-300 text-gray-900 bg-transparent"
                    />
                  )}
                  {block.content ? (
                     // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.content} alt="Media" className="w-full h-full object-cover rounded" />
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-100 rounded">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
              )}

              {block.type === 'table' && (
                <div className="w-full h-full flex flex-col text-sm text-gray-700">
                   <div className="bg-gray-200 p-1 font-bold text-center rounded-t border border-gray-300">Table</div>
                   <textarea
                     readOnly={appMode === 'read' || appMode === 'transform'}
                     value={block.content}
                     onChange={(e) => updateBlockContent(block.id, e.target.value)}
                     className="w-full flex-1 border border-t-0 border-gray-300 outline-none p-2 resize-none bg-transparent"
                     placeholder="Table Data (JSON format or text)"
                   />
                </div>
              )}

            </div>
          </div>
        ))}
      </div>

      {/* Transform Mode Context Menu */}
      {contextMenu.visible && (
        <div 
          className="fixed z-[100] bg-white border border-gray-200 shadow-2xl rounded-xl py-2 w-48"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
            Box Options
          </div>
          <button 
            onClick={() => {
              const block = blocks.find(b => b.id === contextMenu.blockId);
              if (block) toggleScrollMode(block.id, block.scrollMode);
            }} 
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCcw size={16} className="mr-3 text-blue-500" /> 
            {blocks.find(b => b.id === contextMenu.blockId)?.scrollMode === 'grow' ? 'Set to Scroll' : 'Set to Grow'}
          </button>
          <button 
            onClick={() => deleteBlock(contextMenu.blockId!)} 
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <Trash2 size={16} className="mr-3" /> Delete Box
          </button>
        </div>
      )}

      {/* Power Log Modal */}
      {showPowerLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-800 flex items-center">
                <ListTree size={20} className="mr-2 text-indigo-500" /> Note Power Log
              </h3>
              <button onClick={() => setShowPowerLog(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-600 mb-2 font-medium">Document Structure:</p>
              {blocks.filter(b => b.type === 'text' && b.content.includes('#')).length > 0 ? (
                <ul className="space-y-2 text-sm text-gray-800">
                   {/* Simulating extracting headings starting with # */}
                   {blocks.filter(b => b.type === 'text').map(b => 
                      b.content.split('\n').filter(line => line.startsWith('#')).map((h, i) => (
                        <li key={i} className="pl-2 border-l-2 border-indigo-400">{h.replace(/#/g, '').trim()}</li>
                      ))
                   )}
                </ul>
              ) : (
                <p className="text-xs text-gray-400 italic">No structure detected. Start text lines with # to create power nodes.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
