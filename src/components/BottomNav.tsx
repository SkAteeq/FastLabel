import React from 'react';
import { Home, Clock, Settings, FilePlus } from 'lucide-react';
import { cn } from '../lib/utils';

export type TabType = 'home' | 'history' | 'settings';

interface BottomNavProps {
  currentTab: TabType;
  onChange: (tab: TabType) => void;
}

export function BottomNav({ currentTab, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe pb-4 pt-3 px-6 flex justify-between items-center z-50">
      <button 
        onClick={() => onChange('home')}
        className={cn(
          "flex flex-col items-center gap-1 min-w-[64px]",
          currentTab === 'home' ? "text-emerald-500 dark:text-emerald-400" : "text-slate-500"
        )}
      >
        <Home className="w-6 h-6" />
        <span className="text-xs font-medium">Home</span>
      </button>

      <div className="relative -top-6">
        <button 
          onClick={() => onChange('home')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white w-14 h-14 rounded-full flex justify-center items-center shadow-lg active:scale-95 transition-transform"
        >
          <FilePlus className="w-7 h-7" />
        </button>
      </div>

      <button 
        onClick={() => onChange('history')}
        className={cn(
          "flex flex-col items-center gap-1 min-w-[64px]",
          currentTab === 'history' ? "text-emerald-500 dark:text-emerald-400" : "text-slate-500"
        )}
      >
        <Clock className="w-6 h-6" />
        <span className="text-xs font-medium">History</span>
      </button>

      <button 
        onClick={() => onChange('settings')}
        className={cn(
          "flex flex-col items-center gap-1 min-w-[64px]",
          currentTab === 'settings' ? "text-emerald-500 dark:text-emerald-400" : "text-slate-500"
        )}
      >
        <Settings className="w-6 h-6" />
        <span className="text-xs font-medium">Profile</span>
      </button>
    </div>
  );
}
