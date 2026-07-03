import React, { useState, useEffect } from 'react';
import { Clock, RefreshCcw, Copy, Printer } from 'lucide-react';
import { getLabels, deleteLabel } from '../db';
import { LabelRecord } from '../types';

interface HistoryViewProps {
  onDuplicate: (label: LabelRecord) => void;
  onReprint: (label: LabelRecord) => void;
}

export function HistoryView({ onDuplicate, onReprint }: HistoryViewProps) {
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
        <p className="text-sm mt-2 opacity-60 text-center max-w-[250px]">
          Labels you create will appear here for quick reuse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto no-scrollbar bg-slate-50 dark:bg-slate-950 p-4">
      <h2 className="text-[20px] font-bold mb-4 text-slate-900 dark:text-slate-100 px-1">Recent Labels</h2>
      
      <div className="space-y-4 pb-24">
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

            {(label.orderId || label.courierPartner) && (
              <div className="flex flex-wrap gap-2 mb-2">
                {label.orderId && (
                  <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    ID: {label.orderId}
                  </span>
                )}
                {label.courierPartner && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                    Courier: {label.courierPartner}
                  </span>
                )}
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
