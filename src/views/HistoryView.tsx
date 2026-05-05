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
      <div className="flex-1 flex flex-col items-center justify-center pb-24 text-slate-500 p-4">
        <Clock className="w-16 h-16 mb-4 opacity-20" />
        <p>No label history yet.</p>
        <p className="text-sm mt-2 opacity-60 text-center max-w-[250px]">
          Labels you create will appear here for quick reuse.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950 p-4 pb-24">
      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-100">Recent Labels</h2>
      
      <div className="space-y-4">
        {labels.map(label => (
          <div key={label.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                {label.recipient.name || 'Unknown Recipient'}
              </h3>
              <span className="text-xs text-slate-500">
                {new Date(label.timestamp).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
              {label.recipient.address}
            </p>

            <div className="flex gap-2">
              <button 
                onClick={() => handleReprint(label)}
                className="flex-[2] flex items-center justify-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 py-2.5 rounded-lg active:scale-95 transition-transform text-sm font-semibold"
              >
                <Printer className="w-4 h-4" />
                Reprint
              </button>
              <button 
                onClick={() => handleDuplicate(label)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-lg active:scale-95 transition-transform text-sm font-medium"
              >
                <Copy className="w-4 h-4" />
                Duplicate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
