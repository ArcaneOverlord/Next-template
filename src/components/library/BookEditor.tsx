"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Type, Image as ImageIcon, Grid, Trash2, Search, 
  MoreVertical, Share2, Globe, Save, Move, X, ListTree, 
  RefreshCcw, Download, FileUp 
} from 'lucide-react';
import CanvasBlockComponent from './editor/CanvasBlock';

// ------------------------------------------------------------------
// 1. INLINED TABLE PROMPT MODAL
// ------------------------------------------------------------------
interface TablePromptProps { 
  onGenerate: (r: number, c: number, name: string) => void; 
  onCancel: () => void; 
}

function TablePromptModal({ onGenerate, onCancel }: TablePromptProps) {
  const [rows, setRows] = useState(3); 
  const [cols, setCols] = useState(3);
  const [tableName, setTableName] = useState('New Table');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-800">Generate Table</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Table Name</label>
            <input 
              type="text" 
              value={tableName} 
              onChange={(e) => setTableName(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="e.g., User Data" 
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1 text-gray-700">Rows</label>
              <input 
                type="number" 
                min="1" 
                max="20" 
                value={rows} 
                onChange={(e) => setRows(Number(e.target.value))} 
                className="w-full p-2 border border-gray-300 rounded text-center text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1 text-gray-700">Cols</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={cols} 
                onChange={(e) => setCols(Number(e.target.value))} 
                className="w-full p-2 border border-gray-300 rounded text-center text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>
          </div>
        </div>
        <button 
          onClick={() => onGenerate(rows, cols, tableName)} 
          className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition"
        >
          Generate
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 2. MAIN EDITOR
// ------------------------------------------------------------------
export type BlockType = 'text' | 'media' | 'table';
export type ScrollMode = 'grow' | 'scroll';

export interface CanvasBlock { 
  id: string; 
  type: BlockType; 
  content: string; 
  x: number; 
  y: number; 
  w: number; 
  h: number | string; 
  scrollMode: ScrollMode;
  title?: string;
}

interface BookEditorProps { 
  bookId: string; 
  bookName: string; 
}

export default function BookEditor({ bookId, bookName }: BookEditorProps) {
  const [appMode, setAppMode] = useState<'read' | 'edit' | 'transform'>('read');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTablePrompt, setShowTablePrompt] = useState(false);
  
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; blockId: string | null }>({ 
    visible: false, x: 0, y: 0, blockId: null 
  });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blocks, setBlocks] = useState<CanvasBlock[]>([]);
  const [transformBackup, setTransformBackup] = useState<CanvasBlock[]>([]);
  
  // Dragging & Resizing Engine State
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{ id: string, handle: string, initialRect: any } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false); 
        setShowAddMenu(false);
      }
      if (contextMenu.visible) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [contextMenu]);

  // --- ACTIONS ---
  const addBlock = (type: BlockType, tableRows = 2, tableCols = 2, prefillContent = '', tableName = '') => {
    let content = prefillContent;
    if (type === 'table' && !prefillContent) {
      content = JSON.stringify(Array(tableRows).fill(Array(tableCols).fill('')));
    }
    
    let startY = 50;
    blocks.forEach(b => {
      const el = document.getElementById(`block-${b.id}`);
      const h = el ? el.offsetHeight : 100;
      if (b.y + h > startY) startY = b.y + h + 20;
    });

    let blockWidth = 350;
    let blockHeight: number | string = 'auto';
    
    if (type === 'media') {
      blockWidth = 400;
      blockHeight = 300;
    } else if (type === 'table') {
      blockWidth = 500;
    }

    const newBlock: CanvasBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type, 
      content,
      x: 50, 
      y: startY,
      w: blockWidth,
      h: blockHeight, 
      scrollMode: 'grow',
      title: tableName
    };
    
    setBlocks([...blocks, newBlock]);
    setShowAddMenu(false);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
      addBlock('table', 4, 3, '[["Imported","Data","Here"],["...","...","..."]]', file.name);
    } else if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const localUrl = URL.createObjectURL(file);
      addBlock('media', 0, 0, localUrl); 
    } else {
      addBlock('text', 0, 0, `[Extracted text from ${file.name}]`);
    }
    setShowAddMenu(false);
  };

  // --- TRANSFORM & PHYSICS ENGINE ---
  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    if (appMode !== 'transform' || e.button === 2) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    const block = blocks.find(b => b.id === id);
    if (rect && block) {
      setDraggingBlock(id);
      setDragOffset({ x: e.clientX - rect.left - block.x, y: e.clientY - rect.top - block.y });
    }
  };

  const handleResizeDown = (e: React.PointerEvent, id: string, handle: string) => {
    e.stopPropagation();
    const block = blocks.find(b => b.id === id);
    if (block) {
      const elHeight = document.getElementById(`block-${id}`)?.offsetHeight || 100;
      setResizing({ 
        id, 
        handle, 
        initialRect: { x: block.x, y: block.y, w: block.w, h: block.h === 'auto' ? elHeight : block.h } 
      });
      setDragOffset({ x: e.clientX, y: e.clientY });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (appMode !== 'transform') return;
    const rect = canvasRef.current?.getBoundingClientRect();
    
    // Handle Resizing via 4 Corners
    if (resizing && rect) {
      const dx = e.clientX - dragOffset.x;
      const dy = e.clientY - dragOffset.y;
      let { x, y, w, h } = resizing.initialRect;

      if (resizing.handle.includes('r')) w = Math.max(150, w + dx);
      if (resizing.handle.includes('l')) { w = Math.max(150, w - dx); x += dx; }
      if (resizing.handle.includes('b')) h = Math.max(100, h + dy);
      if (resizing.handle.includes('t')) { h = Math.max(100, h - dy); y += dy; }

      setBlocks(blocks.map(b => b.id === resizing.id ? { ...b, x, y, w, h } : b));
      return;
    }

    // Handle Dragging
    if (draggingBlock && rect) {
      const newX = Math.max(0, e.clientX - rect.left - dragOffset.x);
      const newY = Math.max(0, e.clientY - rect.top - dragOffset.y);
      setBlocks(blocks.map(b => b.id === draggingBlock ? { ...b, x: newX, y: newY } : b));
    }
  };

  const handlePointerUp = () => {
    setResizing(null);
    if (!draggingBlock) return;
    
    const activeBlock = blocks.find(b => b.id === draggingBlock);
    if (activeBlock) {
      let finalY = activeBlock.y;
      let hasOverlap = true;
      let iterations = 0; 
      
      const dW = activeBlock.w;
      const dH = activeBlock.h === 'auto' 
        ? document.getElementById(`block-${activeBlock.id}`)?.offsetHeight || 100 
        : activeBlock.h as number;

      while (hasOverlap && iterations < 15) {
        hasOverlap = false;
        for (const b of blocks) {
          if (b.id === draggingBlock) continue;
          const bH = b.h === 'auto' 
            ? document.getElementById(`block-${b.id}`)?.offsetHeight || 100 
            : b.h as number;
          
          if (!(activeBlock.x + dW < b.x || activeBlock.x > b.x + b.w || finalY + dH < b.y || finalY > b.y + bH)) {
            hasOverlap = true;
            finalY = b.y + bH + 16; 
            break;
          }
        }
        iterations++;
      }
      setBlocks(blocks.map(b => b.id === draggingBlock ? { ...b, y: finalY } : b));
    }
    setDraggingBlock(null);
  };

  const handleMenuClick = (x: number, y: number, id: string) => {
    setContextMenu({ visible: true, x, y, blockId: id });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[calc(100vh-8rem)] relative overflow-hidden">
      
      {/* TOOLBAR */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50 z-30">
        
        <div className="relative flex-1 max-w-sm mr-4">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0 relative" ref={menuRef}>
          {appMode === 'read' && (
            <>
              <button 
                onClick={() => setAppMode('edit')} 
                className="px-5 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold text-sm"
              >
                Edit
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  <MoreVertical size={20} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-50 origin-top-right">
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <ListTree size={16} className="mr-3 text-indigo-500" /> Power Log
                    </button>
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <Download size={16} className="mr-3 text-gray-500" /> Export Note
                    </button>
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <Share2 size={16} className="mr-3 text-gray-500" /> Share
                    </button>
                    <button className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                      <Globe size={16} className="mr-3 text-gray-500" /> Publish
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {appMode === 'edit' && (
            <>
              <button 
                onClick={() => setAppMode('read')} 
                className="hidden sm:flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-sm"
              >
                <Save size={16} className="mr-2" /> Save
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setShowAddMenu(!showAddMenu)} 
                  className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-semibold text-sm"
                >
                  <Plus size={16} className="mr-1" /> Add
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-50 origin-top-right">
                    <button 
                      onClick={() => addBlock('text')} 
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Type size={16} className="mr-3" /> Text Box
                    </button>
                    <button 
                      onClick={() => addBlock('media')} 
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <ImageIcon size={16} className="mr-3" /> Media Box
                    </button>
                    <button 
                      onClick={() => { setShowTablePrompt(true); setShowAddMenu(false); }} 
                      className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                    >
                      <Grid size={16} className="mr-3" /> Table Box
                    </button>
                    
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="w-full flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 font-medium"
                    >
                      <FileUp size={16} className="mr-3" /> Import File...
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImport} 
                      className="hidden" 
                      accept=".xlsx,.csv,.docx,.txt,image/*,video/*" 
                    />
                  </div>
                )}
              </div>

              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  <MoreVertical size={20} />
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-xl rounded-xl py-2 z-50 origin-top-right">
                    <button 
                      onClick={() => { 
                        setTransformBackup(JSON.parse(JSON.stringify(blocks))); 
                        setAppMode('transform'); 
                        setIsMenuOpen(false); 
                      }} 
                      className="w-full flex items-center px-4 py-3 text-sm font-bold text-indigo-700 hover:bg-indigo-50"
                    >
                      <Move size={16} className="mr-3" /> Transform
                    </button>
                    <button 
                      onClick={() => { setAppMode('read'); setIsMenuOpen(false); }} 
                      className="sm:hidden w-full flex items-center px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 border-t border-gray-100"
                    >
                      <Save size={16} className="mr-3" /> Save Changes
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {appMode === 'transform' && (
            <>
              <button 
                onClick={() => { setBlocks(transformBackup); setAppMode('edit'); }} 
                className="flex items-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold text-sm"
              >
                <X size={16} className="mr-1" /> <span className="hidden sm:inline">Discard</span>
              </button>
              <button 
                onClick={() => setAppMode('edit')} 
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-sm"
              >
                <Save size={16} className="mr-2" /> Finish
              </button>
            </>
          )}
        </div>
      </div>

      {/* CANVAS */}
      <div 
        ref={canvasRef}
        className={`flex-1 relative overflow-auto p-8 ${appMode === 'read' ? 'bg-white' : appMode === 'transform' ? 'bg-gray-100' : 'bg-gray-50'}`}
        style={{ touchAction: appMode === 'transform' ? 'none' : 'auto', overscrollBehavior: 'none' }}
        onPointerMove={handlePointerMove} 
        onPointerUp={handlePointerUp} 
        onPointerLeave={handlePointerUp}
      >
                {blocks.filter(b => b.content.toLowerCase().includes(searchQuery.toLowerCase())).map((block) => (
          <CanvasBlockComponent 
            key={block.id} 
            block={block} 
            appMode={appMode} 
            onUpdate={updateBlockContent} 
            onPointerDown={handlePointerDown} 
            onResizeDown={handleResizeDown}
            onMenuClick={handleMenuClick}
          />
        ))}

      </div>

      {/* MODALS */}
      {showTablePrompt && (
        <TablePromptModal 
          onGenerate={(r, c, name) => { 
            addBlock('table', r, c, '', name); 
            setShowTablePrompt(false); 
          }} 
          onCancel={() => setShowTablePrompt(false)} 
        />
      )}
      
      {contextMenu.visible && (
        <div 
          className="fixed z-[100] bg-white border border-gray-200 shadow-2xl rounded-xl py-2 w-48" 
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button 
            onClick={() => { 
              setBlocks(blocks.filter(b => b.id !== contextMenu.blockId)); 
              setContextMenu({ ...contextMenu, visible: false }); 
            }} 
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} className="mr-3" /> Delete Box
          </button>
          <button 
            onClick={() => {
              setBlocks(blocks.map(b => b.id === contextMenu.blockId 
                ? { ...b, scrollMode: b.scrollMode === 'grow' ? 'scroll' : 'grow', h: b.scrollMode === 'grow' ? 150 : 'auto' } 
                : b
              ));
              setContextMenu({ ...contextMenu, visible: false });
            }} 
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RefreshCcw size={16} className="mr-3 text-blue-500" /> 
            {blocks.find(b => b.id === contextMenu.blockId)?.scrollMode === 'grow' ? 'Set to Scroll' : 'Set to Grow'}
          </button>
        </div>
      )}
    </div>
  );
}