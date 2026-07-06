import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { getSenderProfile } from './db';
import { SenderProfile, LabelRecord } from './types';
import { BottomNav, TabType } from './components/BottomNav';
import { SettingsView } from './views/SettingsView';
import { HistoryView } from './views/HistoryView';
import { CreatorWizard } from './views/CreatorWizard';
import { Package, Settings as SettingsIcon, ChevronLeft, Plus, Home, Clock } from 'lucide-react';
import { cn } from './lib/utils';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [senderProfile, setSenderProfile] = useState<SenderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [initialLabel, setInitialLabel] = useState<LabelRecord | undefined>(undefined);
  const [initialStep, setInitialStep] = useState(1);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const p = await getSenderProfile();
    if (p) {
      setSenderProfile(p);
    } else {
      setCurrentTab('settings');
    }
    setLoading(false);
  };

  const handleDuplicate = (label: LabelRecord) => {
    setInitialLabel(label);
    setInitialStep(1);
    setCreatingLabel(true);
  };

  const handleReprint = (label: LabelRecord) => {
    setInitialLabel(label);
    setInitialStep(3); // Go straight to preview/print
    setCreatingLabel(true);
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'home') {
      if (!senderProfile) {
        alert('Please setup your sender profile first!');
        setCurrentTab('settings');
        return;
      }
      setInitialLabel(undefined);
      setInitialStep(1);
      setCreatingLabel(true);
    } else {
      setCreatingLabel(false);
      setCurrentTab(tab);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <Package className="w-12 h-12 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans selection:bg-blue-500/30 flex flex-col md:flex-row w-full mx-auto relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 3000, className: 'dark:bg-slate-800 dark:text-white rounded-xl shadow-lg border border-slate-100 dark:border-slate-700' }} />

      {!creatingLabel && (
        <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 h-screen shadow-sm z-20 print:hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md shadow-blue-500/20">
               <Package className="text-white w-6 h-6" /> 
             </div>
             <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">FastLabel</h1>
          </div>
          
          <div className="p-4 flex-1 flex flex-col gap-2">
            <button
              onClick={() => handleTabChange('home')}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium",
                currentTab === 'home' 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              )}
            >
              <Home className="w-5 h-5" />
              Home
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium",
                currentTab === 'history' 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              )}
            >
              <Clock className="w-5 h-5" />
              History
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium",
                currentTab === 'settings' 
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
              )}
            >
              <SettingsIcon className="w-5 h-5" />
              Settings
            </button>
          </div>
          
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
             <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex flex-col items-center text-center border border-slate-100 dark:border-slate-700/50">
               <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-3">
                 <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
               </div>
               <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Shipping Labels</p>
               <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Create and print easily</p>
               <button
                 onClick={() => handleTabChange('home')}
                 className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 shadow hover:shadow-md hover:shadow-blue-500/20 active:scale-[0.98] transition-all font-semibold text-sm"
               >
                 New Label
               </button>
             </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen min-w-0 relative">
        {!creatingLabel && (
          <>
            {/* Mobile Top Header */}
            <div className="md:hidden px-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 safe-top flex justify-between items-center h-16 shrink-0 z-10 shadow-sm">
              {currentTab === 'settings' ? (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentTab('home')} 
                    className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-slate-800 dark:text-slate-200" />
                  </button>
                  <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Settings</h1>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md">
                       <Package className="text-white w-5 h-5" />
                    </div>
                    FastLabel
                  </h1>
                  <button 
                    onClick={() => setCurrentTab('settings')} 
                    className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 transition-colors"
                  >
                    <SettingsIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                  </button>
                </>
              )}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col relative print:hidden bg-[#F8FAFC] dark:bg-slate-950">
              {currentTab === 'history' && (
                <HistoryView 
                  onDuplicate={handleDuplicate} 
                  onReprint={handleReprint} 
                  onCreateNew={() => handleTabChange('home')} 
                />
              )}
              {currentTab === 'settings' && <SettingsView onProfileSaved={loadProfile} />}
              
              {currentTab === 'home' && !creatingLabel && (
                <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
                  <div className="w-32 h-32 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-8 relative">
                    <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-500/20 rounded-full animate-ping opacity-75 duration-1000" />
                    <Package className="w-14 h-14 text-blue-600 dark:text-blue-500 relative z-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center tracking-tight">Ready to Print</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-center max-w-[320px] mb-10 text-lg">
                    Create a new shipping label instantly. No internet connection required.
                  </p>
                  <button
                    onClick={() => handleTabChange('home')}
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 dark:from-blue-500 dark:to-blue-400 text-white rounded-2xl py-4 px-10 shadow-lg hover:shadow-xl shadow-blue-500/25 active:scale-[0.97] transition-all flex items-center justify-center gap-3 text-lg font-semibold w-full max-w-[300px]"
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                    <span>Create New Label</span>
                  </button>
                </div>
              )}
            </div>
            
            <div className="md:hidden print:hidden">
              <BottomNav currentTab={currentTab} onChange={setCurrentTab} />
            </div>
          </>
        )}

        {creatingLabel && senderProfile && (
          <div className="absolute inset-0 z-50 bg-[#F8FAFC] dark:bg-slate-950 flex flex-col print-wrapper">
            <CreatorWizard 
              sender={senderProfile} 
              initialLabel={initialLabel}
              initialStep={initialStep}
              onFinish={() => {
                setCreatingLabel(false);
                setCurrentTab('history');
              }} 
            />
          </div>
        )}
      </main>
    </div>
  );
}
