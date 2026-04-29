"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Image as ImageIcon, Grid, Trash2, Search, MoreVertical, Share2, Globe, Save, Move, X, ListTree, RefreshCcw, Download, FileUp } from 'lucide-react';
import CanvasBlockComponent from './editor/CanvasBlock'; // <-- Make sure path matches where you put CanvasBlock

// 1. INLINED TABLE PROMPT
interface TablePromptProps { onGenerate: (r: number, c: number) => void; onCancel: () => void; }
function TablePromptModal({ onGenerate, onCancel }: TablePromptProps) {
  const [rows, setRows] = useState(3); const [cols, setCols] = useState(3);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Generate Table</h3>
          <button onClick={onCancel} className="text-gray-400"><X size={20} /></button>
        </div>
        <div className="flex space-x-4 mb-4">
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">Rows</label><input type="number" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="w-full p-2 border rounded" /></div>
          <div className="flex-1"><label className="block text-sm font-semibold mb-1">Cols</label><input type="number" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="w-full p-2 border rounded" /></div>
        </div>
        <button onClick={() => onGenerate(rows, cols)} className="w-full bg-blue-600 text-white font-bold py-2 rounded">Generate</button>
      </div>
    </div>
  );
}

// 2. MAIN EDITOR
export type BlockType = 'text' | 'media' | 'table';
export type ScrollMode = 'grow' | 'scroll';
export interface CanvasBlock { id: string; type: BlockType; content: string; x: number; y: number; w: number; h: number | 'auto'; scrollMode: ScrollMode; }

interface BookEditorProps { bookId: string; bookName: string; }

export default function BookEditor({ bookId, bookName }: BookEditorProps) {
  const [appMode, setAppMode] = useState<'read' | 'edit' | 'transform'>('read');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTablePrompt, setShowTablePrompt] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, blockId: string | null }>({ visible: false, x: 0, y: 0, blockId: null });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [transformBackup, setTransformBackup] = useState<CanvasBlock[]>([]);
  
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
  const addBlock = (type: BlockType, tableRows = 2, tableCols = 2, prefillContent = '') => {
    let content = prefillContent;
    if (type === 'table' && !prefillContent) {
      content = JSON.stringify(Array(tableRows).fill(Array(tableCols).fill('')));
    }
    
    // Auto-place below the lowest block to prevent initial overlap
    let startY = 50;
    blocks.forEach(b => {
      const el = document.getElementById(`block-${b.id}`);
      const h = el ? el.offsetHeight : 100;
      if (b.y + h > startY) startY = b.y + h + 20;
    });

    const newBlock: CanvasBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type, content,
      x: 50, y: startY,
      w: type === 'media' ? 300 : type === 'table' ? 400 : 350,
      h: type === 'media' ? 200 : 'auto', scrollMode: 'grow'
    };
    setBlocks([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Mock Import Logic based on extension
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      addBlock('table', 4, 3, '[["Imported","Data","Here"],["...","...","..."]]');
    } else if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      addBlock('media'); // In a real app, you'd upload the blob and return a URL
    } else {
      addBlock('text', 0, 0, `[Extracted text from ${file.name}]`);
    }
    setShowAddMenu(false);
  };

  // --- COLLISION PHYSICS ---
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (appMode !== 'transform' || e.button === 2) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const block = blocks.find(b => b.id === id);
    if (rect && block) {
      setDraggingBlock(id);
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
    
    // Overlap Resolution Engine: If dropped on another block, push it down
    const draggedEl = document.getElementById(`block-${draggingBlock}`);
    if (draggedEl) {
      const rawRect = draggedEl.getBoundingClientRect();
      
      // Create a mutable copy of the DOMRect so TypeScript lets us do math
      let dRect = {
        left: rawRect.left,
        right: rawRect.right,
        top: rawRect.top,
        bottom: rawRect.bottom,
        height: rawRect.height,
        y: rawRect.y
      };

      let hasOverlap = true;
      let safeY = blocks.find(b => b.id === draggingBlock)?.y || 0;

      while (hasOverlap) {
        hasOverlap = false;
        for (const b of blocks) {
          if (b.id === draggingBlock) continue;
          const oEl = document.getElementById(`block-${b.id}`);
          if (!oEl) continue;
          const oRect = oEl.getBoundingClientRect();
          
          // Check intersection
          if (!(dRect.right < oRect.left || dRect.left > oRect.right || dRect.bottom < oRect.top || dRect.top > oRect.bottom)) {
            hasOverlap = true;
            safeY = b.y + oRect.height + 20; // Push below the collided object
            
            // Update dummy dRect to check again
            dRect.y += (safeY - dRect.y);
            dRect.top = dRect.y; // Ensure top is updated for the next loop check
            dRect.bottom = dRect.y + dRect.height;
            break;
          }
        }
      }
      setBlocks(blocks.map(b => b.id === draggingBlock ? { ...b, y: safeY } : b));
    }
    setDraggingBlock(null);
  };


  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden">
      
      {/* TOOLBAR - FIXED SPACING */}
      <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4 bg-gray-50 z-30">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white" />
        </div>

        <div className="flex items-center space-x-3 shrink-0" ref={menuRef}>
          {appMode === 'read' && (
            <>
              <button onClick={() => setAppMode('edit')} className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-sm">Edit</button>
              <div className="relative">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"><MoreVertical size={20} /></button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-50">
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><ListTree size={16} className="mr-3 text-indigo-500" /> Power Log</button>
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><Download size={16} className="mr-3 text-gray-500" /> Export Note</button>
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><Share2 size={16} className="mr-3 text-gray-500" /> Share</button>
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><Globe size={16} className="mr-3 text-gray-500" /> Publish</button>
                  </div>
                )}
              </div>
            </>
          )}

          {appMode === 'edit' && (
            <>
              <div className="relative">
                <button onClick={() => setShowAddMenu(!showAddMenu)} className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold text-sm"><Plus size={16} className="mr-1" /> Add</button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-50">
                    <button onClick={() => addBlock('text')} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><Type size={16} className="mr-3" /> Text Box</button>
                    <button onClick={() => addBlock('media')} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"><ImageIcon size={16} className="mr-3" /> Media Box</button>
                    <button onClick={() => { setShowTablePrompt(true); setShowAddMenu(false); }} className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"><Grid size={16} className="mr-3" /> Table Box</button>
                    
                    <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 font-medium">
                      <FileUp size={16} className="mr-3" /> Import File...
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.csv,.docx,.txt,image/*,video/*" />
                  </div>
                )}
              </div>
              <button onClick={() => { setTransformBackup(JSON.parse(JSON.stringify(blocks))); setAppMode('transform'); }} className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 font-bold text-sm"><Move size={16} className="mr-2" /> Transform</button>
              <button onClick={() => setAppMode('read')} className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm"><Save size={16} className="mr-2" /> Save</button>
            </>
          )}

          {appMode === 'transform' && (
            <>
              <button onClick={() => { setBlocks(transformBackup); setAppMode('edit'); }} className="flex items-center px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm"><X size={16} className="mr-1" /> Discard</button>
              <button onClick={() => setAppMode('edit')} className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm"><Save size={16} className="mr-2" /> Finish</button>
            </>
          )}
        </div>
      </div>

      {/* CANVAS - Blocks Pull-to-refresh when in transform mode */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-auto p-8 ${appMode === 'read' ? 'bg-white' : appMode === 'transform' ? 'bg-gray-100' : 'bg-gray-50'}`}
        style={{ touchAction: appMode === 'transform' ? 'none' : 'auto', overscrollBehavior: 'none' }}
        onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}
      >
        {blocks.filter(b => b.content.toLowerCase().includes(searchQuery.toLowerCase())).map((block) => (
          <CanvasBlockComponent 
            key={block.id} block={block} appMode={appMode} 
            onUpdate={updateBlockContent} onPointerDown={handlePointerDown} onContextMenu={(e, id) => {
              const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
              const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
              setContextMenu({ visible: true, x, y, blockId: id });
            }}
          />
        ))}
      </div>

      {showTablePrompt && <TablePromptModal onGenerate={(r, c) => { addBlock('table', r, c); setShowTablePrompt(false); }} onCancel={() => setShowTablePrompt(false)} />}
      
      {contextMenu.visible && (
        <div className="fixed z-[100] bg-white border border-gray-200 shadow-2xl rounded-xl py-2 w-48" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button onClick={() => { setBlocks(blocks.filter(b => b.id !== contextMenu.blockId)); setContextMenu({ ...contextMenu, visible: false }); }} className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={16} className="mr-3" /> Delete Box</button>
          <button onClick={() => {
            setBlocks(blocks.map(b => b.id === contextMenu.blockId ? { ...b, scrollMode: b.scrollMode === 'grow' ? 'scroll' : 'grow', h: b.scrollMode === 'grow' ? 150 : 'auto' } : b));
            setContextMenu({ ...contextMenu, visible: false });
          }} className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <RefreshCcw size={16} className="mr-3 text-blue-500" /> {blocks.find(b => b.id === contextMenu.blockId)?.scrollMode === 'grow' ? 'Set to Scroll' : 'Set to Grow'}
          </button>
        </div>
      )}
    </div>
  );
}
