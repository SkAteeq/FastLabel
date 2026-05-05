import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { getSenderProfile } from './db';
import { SenderProfile, LabelRecord } from './types';
import { BottomNav, TabType } from './components/BottomNav';
import { SettingsView } from './views/SettingsView';
import { HistoryView } from './views/HistoryView';
import { CreatorWizard } from './views/CreatorWizard';
import { Package } from 'lucide-react';

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
        <Package className="w-12 h-12 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-emerald-500/30 flex flex-col w-full max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 3000, className: 'dark:bg-slate-800 dark:text-white' }} />

      {!creatingLabel && (
        <>
          {/* Top Header */}
          <div className="px-6 pt-8 pb-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 safe-top">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="text-emerald-500 w-7 h-7" /> FastLabel
            </h1>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative print:hidden">
            {currentTab === 'history' && <HistoryView onDuplicate={handleDuplicate} onReprint={handleReprint} />}
            {currentTab === 'settings' && <SettingsView onProfileSaved={loadProfile} />}
            
            {currentTab === 'home' && !creatingLabel && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6">
                  <Package className="w-12 h-12 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Create New Label</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-[280px]">
                  Generate printing-ready shipping labels instantly without the internet.
                </p>
              </div>
            )}
          </div>
          
          <div className="print:hidden">
            <BottomNav currentTab={currentTab} onChange={handleTabChange} />
          </div>
        </>
      )}

      {creatingLabel && senderProfile && (
        <div className="absolute inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col print-wrapper">
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
    </div>
  );
}
