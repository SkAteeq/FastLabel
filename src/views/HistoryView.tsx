import React, { useState, useEffect } from 'react';
import { Clock, RefreshCcw, Copy, Printer, Plus, Package } from 'lucide-react';
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
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-6">
        <div className="w-32 h-32 bg-blue-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-16 h-16 text-blue-300 dark:text-blue-700/50" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No History Yet</h3>
        <p className="text-base mt-1 text-slate-500 text-center max-w-[280px] mb-8 leading-relaxed">
          Labels you create will appear here for quick reuse and reprinting.
        </p>
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-2xl py-3.5 px-8 shadow-md hover:shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base font-bold w-full max-w-[280px]"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create First Label</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full h-full mx-auto bg-transparent overflow-hidden">
      {/* Top Header */}
      <div className="p-4 md:p-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm flex flex-row items-center justify-between shrink-0 z-20">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
             <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
               <Clock className="w-5 h-5" />
             </div>
             Recent Labels
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 hidden md:block">
            View and reprint your previously created labels
          </p>
        </div>
        
        <button
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 px-5 shadow-sm hover:shadow shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline">Create Label</span>
          <span className="md:hidden">Create</span>
        </button>
      </div>

      {/* Independently Scrollable Labels List */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 lg:px-8 space-y-4 pb-24">
        {labels.map(label => (
          <div key={label.id} className="bg-white dark:bg-slate-900 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800 flex flex-col group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight">
                    {label.recipient.name || 'Unknown Recipient'}
                  </h3>
                  <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{new Date(label.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {label.orderId && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="font-medium text-slate-600 dark:text-slate-300">ID: {label.orderId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-[15px] text-slate-600 dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed pl-13">
              {label.recipient.address}
            </p>

            <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <button 
                onClick={() => handleDuplicate(label)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl active:scale-95 transition-all text-sm font-medium border border-slate-200 dark:border-slate-700"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
              <button 
                onClick={() => handleReprint(label)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 py-2.5 rounded-xl active:scale-95 transition-all text-sm font-semibold border border-blue-100 dark:border-blue-800/50"
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
