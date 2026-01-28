
import React, { useState } from 'react';
import { User, ShieldCheck, HeartPulse, Save, AlertCircle, PhoneForwarded, Home } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onGoHome: () => void;
}

const Profile: React.FC<ProfileProps> = ({ profile, onSave, onGoHome }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex-1 p-4 md:p-8 space-y-8 bg-blue-50 overflow-y-auto overflow-x-hidden relative">
      {/* Icon-only Home Button in top-left corner */}
      <button 
        onClick={onGoHome}
        className="absolute top-6 left-6 z-[100] w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 bg-white/80 backdrop-blur-md shadow-lg border border-blue-100 text-blue-600 hover:text-blue-700 hover:bg-white"
        title="Return to Hub"
      >
        <Home className="w-6 h-6" />
      </button>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-20 md:pt-0 md:pl-20">
        <div>
           <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px] mb-1">Personnel Registry</p>
           <h1 className="text-3xl md:text-5xl font-black italic text-blue-950 uppercase tracking-tighter">Responder Profile</h1>
        </div>
        {isSaved && (
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-2xl flex items-center gap-2 animate-in zoom-in duration-300 shadow-lg shadow-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase">Registry Updated</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:pl-20">
        {/* User Details Section */}
        <div className="bg-white border border-blue-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-blue-950 uppercase italic text-lg">User Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Full Legal Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-6 py-4 text-sm font-bold text-blue-950 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
                placeholder="Enter Full Name"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Primary Tactical Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-6 py-4 text-sm font-bold text-blue-950 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all"
                placeholder="+27 00 000 0000"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Blood Type</label>
                <input
                  type="text"
                  value={formData.bloodType}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl px-6 py-4 text-sm font-bold text-blue-950 focus:outline-none focus:border-blue-600 transition-all"
                  placeholder="e.g. O+"
                />
              </div>
              <div className="flex items-center justify-center">
                 <HeartPulse className="w-8 h-8 text-red-100" />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
              <PhoneForwarded className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-black text-white uppercase italic text-lg">Next of Kin / SOS Contact</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-red-600 transition-all"
                placeholder="Emergency Contact Name"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Emergency Phone</label>
              <input
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:outline-none focus:border-red-600 transition-all"
                placeholder="+27 00 000 0000"
                required
              />
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex gap-4 mt-4">
               <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
               <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                 Note: This contact is critical for Responder Secure Access protocols. They are notified instantly on panic triggers.
               </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-center pt-4">
           <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[2rem] font-black uppercase italic tracking-widest text-sm shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-4"
           >
             <Save className="w-5 h-5" />
             Save Profile to Secure Hub
           </button>
        </div>
      </form>

      <div className="pt-8 border-t border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4 md:pl-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-blue-600 w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Profile Status</p>
                <p className="text-xs font-mono text-blue-950 font-bold">RSA-REG-4.2.0 ACTIVE</p>
            </div>
         </div>
         <p className="text-[8px] font-black text-blue-300 uppercase tracking-[0.2em]">Secure Personnel Data Portal</p>
      </div>
    </div>
  );
};

export default Profile;
