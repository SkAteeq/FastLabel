import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, Building2, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { getSenderProfile, saveSenderProfile } from '../db';
import { SenderProfile } from '../types';
import toast from 'react-hot-toast';

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
  const [initialProfile, setInitialProfile] = useState<Omit<SenderProfile, 'id'> | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSenderProfile().then(p => {
      if (p) {
        setProfile(p);
        setInitialProfile(p);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    if (!profile.businessName || !profile.address) {
      toast.error('Business Name and Address are required.');
      return;
    }

    const isUnchanged = initialProfile && 
      initialProfile.businessName === profile.businessName &&
      initialProfile.address === profile.address &&
      initialProfile.phone === profile.phone &&
      initialProfile.logo === profile.logo;

    if (isUnchanged) {
      toast('No update necessary, settings are unchanged.', { icon: 'ℹ️' });
      return;
    }

    try {
      await saveSenderProfile(profile);
      setInitialProfile(profile);
      toast.success('Sender profile updated successfully.', { icon: '👏' });
      onProfileSaved();
    } catch (error) {
      toast.error('Unable to save changes. Please try again.');
    }
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

  if (loading) return <div className="p-4 flex justify-center mt-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
      {/* Top Header */}
      <div className="p-4 md:p-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm shrink-0 z-20 md:hidden">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Sender Profile
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 lg:px-8 pb-24 md:pb-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col items-center mb-8">
              <div 
                className="w-28 h-28 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {profile.logo ? (
                  <>
                    <img src={profile.logo} alt="Logo" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Camera className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest">Upload</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleLogoUpload}
              />
            </div>

            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[15px] transition-all"
                  placeholder="e.g. Acme Corporation"
                  value={profile.businessName}
                  onChange={e => setProfile({...profile, businessName: e.target.value})}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  Phone Number
                </label>
                <input 
                  type="tel"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none text-[15px] transition-all"
                  placeholder="e.g. +1 (555) 000-0000"
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Return Address <span className="text-red-500">*</span>
                </label>
                <textarea 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-4 min-h-[120px] focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none text-[15px] transition-all leading-relaxed"
                  placeholder="Street Address&#10;City, State, ZIP&#10;Country"
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl py-4 px-6 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base font-bold"
          >
            <CheckCircle2 className="w-5 h-5" />
            Save Profile Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
