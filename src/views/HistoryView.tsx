import React, { useState, useEffect } from 'react';
import { Clock, RefreshCcw, Copy, Printer, Plus } from 'lucide-react';
import { getLabels, deleteLabel } from '../db';
import { LabelRecord } from '../types';

interface HistoryViewProps {
  onDuplicate: (label: LabelRecord) => void;
  onReprint: (label: LabelRecord) => void;
  onCreateNew: () => void;
}

export function HistoryView({ onDuplicate, onReprint, onCreateNew }: HistoryViewProps) {
  const [labels, setLabels] = useState<LabelRecord[]>([]);

  useEffect(() => {
    loadLabels();
  }, []);

  const loadLabels = async () => {
    const list = await getLabels(50);
    setLabels(list);
  };

  const handleDuplicate = (label: LabelRecord) => {
    onDuplicate(label);
  };

  const handleReprint = (label: LabelRecord) => {
    onReprint(label);
  };

  if (labels.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-4">
        <Clock className="w-16 h-16 mb-4 xl:w-20 xl:h-20 opacity-20" />
        <p className="text-lg">No label history yet.</p>
        <p className="text-sm mt-2 opacity-60 text-center max-w-[250px] mb-6">
          Labels you create will appear here for quick reuse.
        </p>
        <button
          onClick={onCreateNew}
          className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl py-3 px-6 shadow-md shadow-emerald-500/10 active:scale-95 transition-transform flex items-center justify-center gap-2 text-base font-bold"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create New Label</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sticky Top Header with Create New Label Button */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col gap-3 shrink-0 z-20">
        <div className="flex justify-between items-center">
          <h2 className="text-[20px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-500" /> Recent Labels
          </h2>
        </div>
        
        <button
          onClick={onCreateNew}
          className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white rounded-xl py-3.5 px-4 shadow-md hover:shadow-lg shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base font-bold"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create New Label</span>
        </button>
      </div>

      {/* Independently Scrollable Labels List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        {labels.map(label => (
          <div key={label.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-[18px] text-slate-900 dark:text-slate-100 leading-tight">
                {label.recipient.name || 'Unknown Recipient'}
              </h3>
              <span className="text-[12px] text-slate-500 mt-0.5 whitespace-nowrap ml-2">
                {new Date(label.timestamp).toLocaleDateString()}
              </span>
            </div>

            {label.orderId && (
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  ID: {label.orderId}
                </span>
              </div>
            )}
            
            <p className="text-[14px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
              {label.recipient.address}
            </p>

            <div className="flex gap-3 mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => handleDuplicate(label)}
                className="flex-1 flex items-center justify-center gap-2 bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 min-h-[48px] rounded-xl active:scale-95 transition-transform text-[14px] font-medium"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button 
                onClick={() => handleReprint(label)}
                className="flex-[1.5] flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white min-h-[48px] rounded-xl active:scale-95 transition-transform text-[14px] font-bold"
              >
                <Printer className="w-4 h-4" />
                Reprint
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
