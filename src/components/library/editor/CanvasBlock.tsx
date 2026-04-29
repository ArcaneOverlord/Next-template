"use client";
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { CanvasBlock as BlockData } from './BookEditor';

interface CanvasBlockProps {
  block: BlockData;
  appMode: 'read' | 'edit' | 'transform';
  onUpdate: (id: string, newContent: string) => void;
  onPointerDown: (e: React.PointerEvent, id: string) => void;
  onContextMenu: (e: React.MouseEvent | React.TouchEvent, id: string) => void;
}

export default function CanvasBlock({ block, appMode, onUpdate, onPointerDown, onContextMenu }: CanvasBlockProps) {
  
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

  // UI styling based on mode
  const modeStyles = {
    read: 'border-none bg-transparent shadow-none', // Invisible wrapper
    edit: 'border border-gray-200 bg-white shadow-sm hover:border-blue-300', // Subtle boxes
    transform: 'border-2 border-dashed border-indigo-400 bg-white/90 shadow-lg cursor-move' // High visibility
  };

  return (
    <div 
      id={`block-${block.id}`}
      className={`absolute rounded-xl transition-colors ${modeStyles[appMode]}`}
      style={{
        left: `${block.x}px`, top: `${block.y}px`, width: `${block.w}px`,
        height: block.h === 'auto' ? 'auto' : `${block.h}px`,
        resize: appMode === 'transform' ? 'both' : 'none',
        overflow: block.scrollMode === 'scroll' || appMode === 'transform' ? 'auto' : 'visible',
      }}
      onPointerDown={(e) => onPointerDown(e, block.id)}
      onContextMenu={(e) => onContextMenu(e, block.id)}
      onTouchStart={(e) => {
        if (appMode === 'transform') {
          const timer = setTimeout(() => onContextMenu(e, block.id), 600);
          (e.target as any).dataset.timer = timer.toString();
        }
      }}
      onTouchEnd={(e) => clearTimeout(Number((e.target as any).dataset.timer))}
    >
      
      {/* Circular Transform Handles */}
      {appMode === 'transform' && (
        <>
          <div className="absolute top-2 left-2 bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow pointer-events-none z-20">Move</div>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-tl-full rounded-br-xl pointer-events-none z-20 shadow-inner flex items-end justify-end p-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </>
      )}

      {/* Content Container */}
      <div className={`w-full h-full ${appMode === 'transform' ? 'pointer-events-none opacity-50' : 'p-3'}`}>
        
        {/* TEXT BLOCK */}
        {block.type === 'text' && (
          <textarea
            readOnly={appMode === 'read' || appMode === 'transform'}
            value={block.content}
            onChange={(e) => onUpdate(block.id, e.target.value)}
            placeholder="Type here..."
            className={`w-full h-full resize-none border-none outline-none text-gray-800 bg-transparent ${appMode === 'read' ? 'cursor-default' : ''}`}
            style={{ minHeight: '50px' }}
          />
        )}

        {/* MEDIA BLOCK */}
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

        {/* TABLE BLOCK */}
        {block.type === 'table' && (
          <div className="w-full h-full overflow-x-auto">
            {appMode !== 'read' && <div className="text-xs font-bold text-gray-400 uppercase mb-2 text-center tracking-widest">Table Data</div>}
            <table className={`w-full border-collapse ${appMode === 'read' ? '' : 'border border-gray-300'}`}>
              <tbody>
                {tableData.map((row, rIndex) => (
                  <tr key={rIndex}>
                    {row.map((cell, cIndex) => (
                      <td key={cIndex} className={`border ${appMode === 'read' ? 'border-gray-200' : 'border-gray-300'} p-0`}>
                        <textarea
                          readOnly={appMode === 'read' || appMode === 'transform'}
                          value={cell}
                          onChange={(e) => updateTableCell(rIndex, cIndex, e.target.value)}
                          className="w-full min-w-[100px] bg-transparent outline-none p-2 resize-none text-sm text-gray-800"
                          rows={cell.split('\n').length || 1}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
