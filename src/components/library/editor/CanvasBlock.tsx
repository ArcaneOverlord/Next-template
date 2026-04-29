"use client";
import React, { useRef } from 'react';
import { Image as ImageIcon, MoreVertical } from 'lucide-react';
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

  const modeStyles = {
    read: 'border-none bg-transparent shadow-none', 
    edit: 'border border-gray-200 bg-white shadow-sm', 
    transform: 'border-2 border-dashed border-indigo-400 bg-white shadow-lg cursor-move rounded-2xl' 
  };

  return (
    <div 
      id={`block-${block.id}`}
      ref={blockRef}
      className={`absolute transition-colors ${modeStyles[appMode]} flex flex-col`}
      style={{
        left: `${block.x}px`, 
        top: `${block.y}px`, 
        width: `${block.w}px`,
        height: block.scrollMode === 'grow' ? 'max-content' : `${block.h}px`,
        resize: appMode === 'transform' ? 'both' : 'none',
        zIndex: appMode === 'transform' ? 20 : 10,
        overflow: 'hidden' // We handle internal scroll manually now
      }}
      onPointerDown={(e) => onPointerDown(e, block.id)}
      onContextMenu={(e) => onContextMenu(e, block.id)}
    >
      
      {/* Transform Mode Visuals & Menu Trigger */}
      {appMode === 'transform' && (
        <>
          <div className="absolute top-2 left-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow pointer-events-none z-30">Move</div>
          <button 
            onPointerDown={(e) => { e.stopPropagation(); onContextMenu(e, block.id); }} 
            className="absolute top-2 right-2 w-8 h-8 bg-white border border-gray-200 text-gray-700 rounded-full shadow-md z-30 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100"
          >
            <MoreVertical size={16} />
          </button>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-tl-full rounded-br-2xl pointer-events-none z-30 shadow-inner flex items-end justify-end p-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </>
      )}

      {/* Content Container */}
      <div className={`w-full flex-1 flex flex-col ${appMode === 'transform' ? 'pointer-events-none opacity-60' : 'p-3'} ${block.type !== 'table' && block.scrollMode === 'scroll' ? 'overflow-y-auto' : ''}`}>
        
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
              <input type="text" placeholder="Paste Media URL" value={block.content} onChange={(e) => onUpdate(block.id, e.target.value)} className="w-full text-xs p-1 mb-2 border-b border-gray-300 text-gray-900 bg-transparent outline-none focus:border-blue-500" />
            )}
            {block.content ? (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={block.content} alt="Media" className="w-full h-full object-cover rounded-lg" />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-100 rounded-lg"><ImageIcon size={32} /></div>
            )}
          </div>
        )}

        {block.type === 'table' && (
          <div className="w-full h-full flex flex-col">
            {/* STATIC TABLE HEADER (Won't scroll) */}
            {appMode !== 'read' && (
              <div className="text-sm font-bold text-gray-800 bg-gray-100 p-2 border border-gray-300 border-b-0 rounded-t shrink-0 flex items-center justify-center">
                {block.title || 'Table Data'}
              </div>
            )}
            
            {/* SCROLLABLE CELLS */}
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
