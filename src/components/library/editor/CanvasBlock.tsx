"use client";
import React, { useRef } from 'react';
import { Image as ImageIcon, MoreVertical, Upload } from 'lucide-react';
import { CanvasBlock as BlockData } from './BookEditor'; 

interface CanvasBlockProps {
  block: BlockData;
  appMode: 'read' | 'edit' | 'transform';
  onUpdate: (id: string, newContent: string) => void;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

export default function CanvasBlock({ block, appMode, onUpdate, onPointerDown, onContextMenu }: CanvasBlockProps) {
  
  const blockRef = useRef<HTMLDivElement>(null);

  // Parse table data safely
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
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  // Helper for local file selection
  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate(block.id, url);
    }
  };

  const modeStyles = {
    read: 'border-none bg-transparent shadow-none', 
    edit: 'border border-gray-200 bg-white shadow-sm hover:border-blue-300 transition-colors', 
    transform: 'border-2 border-dashed border-indigo-400 bg-white/95 shadow-2xl cursor-move' 
  };

  return (
    <div 
      id={`block-${block.id}`}
      ref={blockRef}
      className={`absolute flex flex-col ${modeStyles[appMode]}`}
      style={{
        left: `${block.x}px`, 
        top: `${block.y}px`, 
        width: `${block.w}px`,
        height: block.scrollMode === 'grow' ? 'max-content' : `${block.h}px`,
        resize: appMode === 'transform' ? 'both' : 'none',
        zIndex: appMode === 'transform' ? 20 : 10,
        overflow: 'visible' 
      }}
      onPointerDown={(e) => onPointerDown(e, block.id)}
      onContextMenu={(e) => onContextMenu(e, block.id)}
    >
      
      {/* Transform Mode Visuals & Menu Trigger */}
      {appMode === 'transform' && (
        <>
          {/* 4 Corner Transform Bubbles */}
          <div className="absolute top-0 left-0 w-3 h-3 bg-indigo-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-30 shadow-md"></div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-indigo-600 rounded-full translate-x-1/2 -translate-y-1/2 z-30 shadow-md"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 bg-indigo-600 rounded-full -translate-x-1/2 translate-y-1/2 z-30 shadow-md"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-indigo-600 rounded-full translate-x-1/2 translate-y-1/2 z-30 shadow-md pointer-events-none flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          
          {/* Menu Button Moved to Top-Left */}
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onContextMenu(e, block.id); }} 
            className="absolute -top-3 -left-3 w-8 h-8 bg-white border border-indigo-200 text-indigo-700 rounded-full shadow-lg z-40 flex items-center justify-center hover:bg-indigo-50 active:bg-indigo-100"
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
                <input 
                  type="text" 
                  placeholder="Paste Media URL here..." 
                  value={block.content} 
                  onChange={(e) => onUpdate(block.id, e.target.value)} 
                  className="w-full text-xs p-2 border border-gray-200 rounded text-gray-900 bg-white outline-none focus:border-blue-500" 
                />
                <div className="flex items-center space-x-2">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">OR</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <label className="flex items-center justify-center w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-2 rounded cursor-pointer transition-colors border border-blue-200">
                  <Upload size={14} className="mr-2" />
                  Select from Device
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
          <div className="w-full h-full flex flex-col">
            {appMode !== 'read' && (
              <div className="text-sm font-bold text-gray-800 bg-gray-100 p-2 border border-gray-300 border-b-0 rounded-t shrink-0 flex items-center justify-center">
                {block.title || 'Table Data'}
              </div>
            )}
            
            <div className={`w-full ${block.scrollMode === 'scroll' ? 'flex-1 overflow-auto' : 'overflow-x-auto'} ${appMode === 'read' ? '' : 'border border-gray-300 rounded-b'}`}>
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
        )}
      </div>
    </div>
  );
}
