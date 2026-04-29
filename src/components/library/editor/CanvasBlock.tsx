"use client";
import React, { useRef, useState } from 'react';
import { Image as ImageIcon, MoreVertical, Upload } from 'lucide-react';
import { CanvasBlock as BlockData } from './BookEditor'; 

// --- FORCE COMPILE FIX: Optional Props & Ghost Catcher ---
interface CanvasBlockProps {
  block: BlockData;
  appMode: 'read' | 'edit' | 'transform';
  onUpdate: (id: string, newContent: string) => void;
  onPointerDown?: (e: React.PointerEvent, id: string) => void;
  onResizeDown?: (e: React.PointerEvent, id: string, handle: string) => void;
  onMenuClick?: (x: number, y: number, id: string) => void;
  onContextMenu?: (e: any, id: string) => void; 
}

export default function CanvasBlock({ block, appMode, onUpdate, onPointerDown, onResizeDown, onMenuClick, onContextMenu }: CanvasBlockProps) {
  
  const blockRef = useRef<HTMLDivElement>(null);
  
  // Table Pinch-To-Zoom State
  const [tableScale, setTableScale] = useState(1);
  const initialDist = useRef(0);

  let tableData: string[][] = [];
  if (block.type === 'table') {
    try { tableData = JSON.parse(block.content); } 
    catch { tableData = [['']]; }
  }

  const updateTableCell = (rowIndex: number, colIndex: number, val: string) => {
    const newData = [...tableData];
    newData[rowIndex][colIndex] = val;
    onUpdate(block.id, JSON.stringify(newData));
  };

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (block.scrollMode === 'grow') {
      e.target.style.height = '0px'; 
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpdate(block.id, URL.createObjectURL(file));
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use optional chaining just in case
    onMenuClick?.(e.clientX, e.clientY + 20, block.id);
  };

  // Pinch-to-Zoom Engine
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      initialDist.current = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault(); // Stop screen scrolling while zooming
      const dist = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
      const zoomDelta = dist / initialDist.current;
      setTableScale(prev => Math.min(Math.max(0.5, prev * zoomDelta), 3)); // Clamp scale between 0.5x and 3x
      initialDist.current = dist;
    }
  };

  const modeStyles = {
    read: 'border-none bg-transparent shadow-none', 
    edit: 'border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors', 
    transform: 'border-2 border-indigo-400 bg-white/95 shadow-2xl cursor-move' 
  };

  return (
    <div 
      id={`block-${block.id}`}
      ref={blockRef}
      className={`absolute flex flex-col ${modeStyles[appMode]}`}
      style={{
        left: `${block.x}px`, top: `${block.y}px`, 
        width: `${block.w}px`, height: block.scrollMode === 'grow' ? 'max-content' : `${block.h}px`,
        zIndex: appMode === 'transform' ? 20 : 10,
        overflow: 'visible',
        borderRadius: appMode === 'transform' ? '16px' : '8px'
      }}
      onPointerDown={(e) => onPointerDown?.(e, block.id)}
    >
      
      {/* Transform Mode Visuals */}
      {appMode === 'transform' && (
        <>
          {/* 4 Corner Custom Resize Handles */}
          <div onPointerDown={(e) => onResizeDown?.(e, block.id, 'tl')} className="absolute top-0 left-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 z-30 cursor-nwse-resize flex items-center justify-center"><div className="w-3 h-3 bg-indigo-600 rounded-full shadow-md"></div></div>
          <div onPointerDown={(e) => onResizeDown?.(e, block.id, 'tr')} className="absolute top-0 right-0 w-6 h-6 translate-x-1/2 -translate-y-1/2 z-30 cursor-nesw-resize flex items-center justify-center"><div className="w-3 h-3 bg-indigo-600 rounded-full shadow-md"></div></div>
          <div onPointerDown={(e) => onResizeDown?.(e, block.id, 'bl')} className="absolute bottom-0 left-0 w-6 h-6 -translate-x-1/2 translate-y-1/2 z-30 cursor-nesw-resize flex items-center justify-center"><div className="w-3 h-3 bg-indigo-600 rounded-full shadow-md"></div></div>
          <div onPointerDown={(e) => onResizeDown?.(e, block.id, 'br')} className="absolute bottom-0 right-0 w-6 h-6 translate-x-1/2 translate-y-1/2 z-30 cursor-nwse-resize flex items-center justify-center"><div className="w-3 h-3 bg-indigo-600 rounded-full shadow-md"></div></div>
          
          {/* Simple Box Menu Button via Click */}
          <button 
            onClick={handleMenuClick}
            onPointerDown={(e) => e.stopPropagation()} 
            className="absolute -top-4 left-4 w-8 h-8 bg-white border border-indigo-200 text-indigo-700 rounded-full shadow-lg z-40 flex items-center justify-center hover:bg-indigo-50"
          >
            <MoreVertical size={16} />
          </button>
        </>
      )}

      {/* Content Container */}
      <div className={`w-full flex-1 flex flex-col ${appMode === 'transform' ? 'pointer-events-none opacity-80' : 'p-3'} ${block.type !== 'table' && block.scrollMode === 'scroll' ? 'overflow-y-auto' : ''}`}>
        
        {block.type === 'text' && (
          <textarea
            readOnly={appMode === 'read' || appMode === 'transform'}
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            onInput={handleAutoResize}
            placeholder="Type here..."
            className={`w-full h-full resize-none border-none outline-none text-gray-900 bg-transparent ${appMode === 'read' ? 'cursor-default' : ''}`}
            style={{ minHeight: '50px', overflow: block.scrollMode === 'scroll' ? 'auto' : 'hidden' }}
          />
        )}

        {block.type === 'media' && (
          <div className="w-full h-full flex flex-col">
            {appMode === 'edit' && (
              <div className="flex flex-col mb-3 space-y-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                <input type="text" placeholder="Paste Media URL here..." value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} className="w-full text-xs p-2 border border-gray-200 rounded text-gray-900 bg-white outline-none focus:border-blue-500" />
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <label className="flex items-center justify-center w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded cursor-pointer transition-colors border border-blue-200">
                  <Upload size={14} className="mr-2" /> Select from Device
                  <input type="file" className="hidden" accept="image/*,video/*" onChange={handleLocalFileSelect} />
                </label>
              </div>
            )}
            
            {block.content ? (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={block.content} alt="Media" className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-100 rounded-lg min-h-[150px]">
                <ImageIcon size={32} className="mb-2 text-gray-300" />
                <span className="text-xs font-medium">No Media Provided</span>
              </div>
            )}
          </div>
        )}

        {block.type === 'table' && (
          <div 
            className="w-full h-full flex flex-col relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {appMode !== 'read' && (
              <div className="text-sm font-bold text-gray-800 bg-gray-100 p-2 border border-gray-300 border-b-0 rounded-t shrink-0 flex items-center justify-between z-10">
                <span>{block.title || 'Table Data'}</span>
                <span className="text-[10px] text-gray-400 font-normal">Pinch to Zoom</span>
              </div>
            )}
            
            <div className={`w-full ${block.scrollMode === 'scroll' ? 'flex-1 overflow-auto' : 'overflow-x-auto'} ${appMode === 'read' ? '' : 'border border-gray-300 rounded-b relative'}`}>
              <div style={{ transform: `scale(${tableScale})`, transformOrigin: 'top left', transition: 'transform 0.1s ease-out' }}>
                <table className="w-full border-collapse">
                  <tbody>
                    {tableData.map((row, rIndex) => (
                      <tr key={rIndex}>
                        {row.map((cell, cIndex) => (
                          <td key={cIndex} className={`border ${appMode === 'read' ? 'border-transparent' : 'border-gray-200'} p-0 align-top bg-white`}>
                            <textarea
                              readOnly={appMode === 'read' || appMode === 'transform'}
                              value={cell}
                              onChange={(e) => updateTableCell(rIndex, cIndex, e.target.value)}
                              onInput={handleAutoResize}
                              className="w-full min-w-[80px] bg-transparent outline-none p-2 resize-none text-sm text-gray-900 overflow-hidden"
                              rows={1}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
