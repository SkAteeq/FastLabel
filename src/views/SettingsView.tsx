import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save } from 'lucide-react';
import { getSenderProfile, saveSenderProfile } from '../db';
import { SenderProfile } from '../types';

interface SettingsViewProps {
  onProfileSaved: () => void;
}

export function SettingsView({ onProfileSaved }: SettingsViewProps) {
  const [profile, setProfile] = useState<Omit<SenderProfile, 'id'>>({
    businessName: '',
    address: '',
    phone: '',
    logo: ''
  });
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSenderProfile().then(p => {
      if (p) setProfile(p);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!profile.businessName || !profile.address) {
      alert('Business Name and Address are required.');
      return;
    }
    await saveSenderProfile(profile);
    onProfileSaved();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex-1 flex flex-col pb-24 overflow-y-auto no-scrollbar bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4">
      <div className="space-y-5 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 mt-2">
        
        <div className="flex flex-col items-center mb-6">
          <div 
            className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {profile.logo ? (
              <img src={profile.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <p className="text-[13px] text-slate-500 mt-3 font-medium">Tap to upload Logo</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleLogoUpload}
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Business Name *</label>
          <input 
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[48px] focus:ring-2 focus:ring-emerald-500 outline-none text-[15px]"
            placeholder="Your Business Name"
            value={profile.businessName}
            onChange={e => setProfile({...profile, businessName: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
          <input 
            type="tel"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[48px] focus:ring-2 focus:ring-emerald-500 outline-none text-[15px]"
            placeholder="e.g. +1 234 567 8900"
            value={profile.phone}
            onChange={e => setProfile({...profile, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Return Address *</label>
          <textarea 
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 min-h-[100px] focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-[15px]"
            placeholder="Street, City, Postal Code"
            rows={4}
            value={profile.address}
            onChange={e => setProfile({...profile, address: e.target.value})}
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="mt-6 flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white p-4 min-h-[48px] rounded-xl font-bold active:scale-95 transition-transform text-[15px]"
      >
        <Save className="w-5 h-5" />
        Save Profile
      </button>
    </div>
  );
}
