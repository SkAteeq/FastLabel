import React from 'react';
import { Home, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export type TabType = 'home' | 'history' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onChange: (tab: TabType) => void;
}

export function BottomNav({ currentTab, onChange }: BottomNavProps) {
  if (currentTab === 'settings') return null;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe z-50">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => onChange('home')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
            currentTab === 'home' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
          )}
        >
          <div className={cn(
            "px-4 py-1 rounded-full transition-colors", 
            currentTab === 'home' && "bg-blue-50 dark:bg-blue-900/40 font-bold"
          )}>
            <Home className="w-6 h-6" strokeWidth={currentTab === 'home' ? 2.5 : 2} />
          </div>
          <span className="text-[11px] font-medium">Home</span>
        </button>

        <button 
          onClick={() => onChange('history')}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
            currentTab === 'history' ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"
          )}
        >
          <div className={cn(
            "px-4 py-1 rounded-full transition-colors", 
            currentTab === 'history' && "bg-blue-50 dark:bg-blue-900/40 font-bold"
          )}>
            <Clock className="w-6 h-6" strokeWidth={currentTab === 'history' ? 2.5 : 2} />
          </div>
          <span className="text-[11px] font-medium">History</span>
        </button>
      </div>
    </div>
  );
}
