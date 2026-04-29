"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Image as ImageIcon, Grid, Trash2, Search, MoreVertical, Share2, Globe, Save, Move, X, ListTree, RefreshCcw } from 'lucide-react';
import CanvasBlock from './CanvasBlock';

// ------------------------------------------------------------------
// 1. INLINED TABLE PROMPT MODAL (Bypasses Vercel import errors)
// ------------------------------------------------------------------
interface TablePromptProps {
  onGenerate: (rows: number, cols: number) => void;
  onCancel: () => void;
}

function TablePromptModal({ onGenerate, onCancel }: TablePromptProps) {
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

// ------------------------------------------------------------------
// 2. MAIN BOOK EDITOR COMPONENT
// ------------------------------------------------------------------
interface BookEditorProps { bookId: string; bookName: string; }
export type BlockType = 'text' | 'media' | 'table';
export type ScrollMode = 'grow' | 'scroll';

export interface CanvasBlock {
  id: string; type: BlockType; content: string; 
  x: number; y: number; w: number; h: number | 'auto'; scrollMode: ScrollMode;
}

export default function BookEditor({ bookId, bookName }: BookEditorProps) {
  const [appMode, setAppMode] = useState<'read' | 'edit' | 'transform'>('read');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dropdowns
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTablePrompt, setShowTablePrompt] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, blockId: string | null }>({ visible: false, x: 0, y: 0, blockId: null });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [transformBackup, setTransformBackup] = useState<CanvasBlock[]>([]);
  
  // Drag State
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [initialDragPos, setInitialDragPos] = useState({ x: 0, y: 0 });

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false); setShowAddMenu(false);
      }
      if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  // --- ACTIONS ---
  const addBlock = (type: BlockType, tableRows = 2, tableCols = 2) => {
    let content = '';
    if (type === 'table') {
      const grid = Array(tableRows).fill(Array(tableCols).fill(''));
      content = JSON.stringify(grid);
    }
    const newBlock: CanvasBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type, content,
      x: 50 + (blocks.length * 20), y: 50 + (blocks.length * 20),
      w: type === 'media' ? 300 : type === 'table' ? 400 : 250,
      h: type === 'media' ? 200 : 'auto', scrollMode: 'grow'
    };
    setBlocks([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  // --- COLLISION & DRAG LOGIC ---
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (appMode !== 'transform' || e.button === 2) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const block = blocks.find(b => b.id === id);
    if (rect && block) {
      setDraggingBlock(id);
      setInitialDragPos({ x: block.x, y: block.y }); 
      setDragOffset({ x: e.clientX - rect.left - block.x, y: e.clientY - rect.top - block.y });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (appMode !== 'transform' || !draggingBlock) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
      const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);
      setBlocks(blocks.map(b => b.id === draggingBlock ? { ...b, x: newX, y: newY } : b));
    }
  };

  const handlePointerUp = () => {
    if (!draggingBlock) return;
    
    // Check DOM collision
    const draggedEl = document.getElementById(`block-${draggingBlock}`);
    if (draggedEl) {
      const dRect = draggedEl.getBoundingClientRect();
      const collision = blocks.some(b => {
        if (b.id === draggingBlock) return false;
        const otherEl = document.getElementById(`block-${b.id}`);
        if (!otherEl) return false;
        const oRect = otherEl.getBoundingClientRect();
        return !(dRect.right < oRect.left || dRect.left > oRect.right || dRect.bottom < oRect.top || dRect.top > oRect.bottom);
      });

      // If collision detected, revert to initial position
      if (collision) {
        setBlocks(blocks.map(b => b.id === draggingBlock ? { ...b, x: initialDragPos.x, y: initialDragPos.y } : b));
      }
    }
    setDraggingBlock(null);
  };

  // --- CONTEXT MENU ---
  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, id: string) => {
    if (appMode !== 'transform') return;
    e.preventDefault();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setContextMenu({ visible: true, x, y, blockId: id });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden">
      
      {/* TOOLBAR */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between bg-gray-50 z-20">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search in note..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 placeholder-gray-400" />
        </div>

        <div className="flex items-center space-x-3" ref={menuRef}>
          {appMode === 'read' && (
            <>
              <button onClick={() => setAppMode('edit')} className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold transition text-sm">Edit</button>
              <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition"><MoreVertical size={20} /></button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 origin-top-right">
                    <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"><ListTree size={16} className="mr-3 text-indigo-500" /> Power Log</button>
                  </div>
                )}
              </div>
            </>
          )}

          {appMode === 'edit' && (
            <>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold transition text-sm"><Plus size={16} className="mr-1" /> Add</button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 origin-top-right">
                    <button onClick={() => addBlock('text')} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Type size={16} className="mr-2" /> Text Box</button>
                    <button onClick={() => addBlock('media')} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><ImageIcon size={16} className="mr-2" /> Media Box</button>
                    <button onClick={() => { setShowTablePrompt(true); setShowAddMenu(false); }} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"><Grid size={16} className="mr-2" /> Table Box</button>
                  </div>
                )}
              </div>
              <button onClick={() => { setTransformBackup(JSON.parse(JSON.stringify(blocks))); setAppMode('transform'); }} className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-bold transition text-sm"><Move size={16} className="mr-2" /> Transform</button>
              <button onClick={() => setAppMode('read')} className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition text-sm"><Save size={16} className="mr-2" /> Save</button>
            </>
          )}

          {appMode === 'transform' && (
            <>
              <button onClick={() => { setBlocks(transformBackup); setAppMode('edit'); }} className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold transition text-sm"><X size={16} className="mr-1" /> Discard</button>
              <button onClick={() => setAppMode('edit')} className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold transition text-sm"><Save size={16} className="mr-2" /> Finish</button>
            </>
          )}
        </div>
      </div>

      {/* CANVAS */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-auto p-8 ${appMode === 'read' ? 'bg-white' : appMode === 'transform' ? 'bg-gray-100' : 'bg-gray-50'}`}
        onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
      >
        {blocks.filter(b => b.content.toLowerCase().includes(searchQuery.toLowerCase())).map((block) => (
          <CanvasBlock 
            key={block.id} block={block} appMode={appMode} 
            onUpdate={updateBlockContent} onPointerDown={handlePointerDown} onContextMenu={handleContextMenu}
          />
        ))}
      </div>

      {/* MODALS */}
      {showTablePrompt && <TablePromptModal onGenerate={(r, c) => { addBlock('table', r, c); setShowTablePrompt(false); }} onCancel={() => setShowTablePrompt(false)} />}
      
      {contextMenu.visible && (
        <div className="fixed z-[100] bg-white border border-gray-200 shadow-2xl rounded-xl py-2 w-48" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={() => { setBlocks(blocks.filter(b => b.id !== contextMenu.blockId)); setContextMenu({ ...contextMenu, visible: false }); }} className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition"><Trash2 size={16} className="mr-3" /> Delete Box</button>
          <button onClick={() => {
            setBlocks(blocks.map(b => b.id === contextMenu.blockId ? { ...b, scrollMode: b.scrollMode === 'grow' ? 'scroll' : 'grow', h: b.scrollMode === 'grow' ? 150 : 'auto' } : b));
            setContextMenu({ ...contextMenu, visible: false });
          }} className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <RefreshCcw size={16} className="mr-3 text-blue-500" /> {blocks.find(b => b.id === contextMenu.blockId)?.scrollMode === 'grow' ? 'Set to Scroll' : 'Set to Grow'}
          </button>
        </div>
      )}
    </div>
  );
}
