
import React, { useState, useEffect, useMemo } from 'react';
import { Shield, MapPin, AlertCircle, Navigation, Heart, Info, Zap, ChevronRight } from 'lucide-react';
import { gemini } from '../services/geminiService';
import { Coordinates, SafetyLocation, LocationType } from '../types';

interface GuardianHubProps {
  location: Coordinates | null;
  safeZones: SafetyLocation[];
  onNavigate: (view: 'MAP' | 'SOS') => void;
}

const GuardianHub: React.FC<GuardianHubProps> = ({ location, safeZones, onNavigate }) => {
  const [briefing, setBriefing] = useState<string>('Initializing safety tactical analysis...');
  const [safetyScore, setSafetyScore] = useState(85);

  useEffect(() => {
    if (location) {
      gemini.getSafetyBriefing(location.lat, location.lng).then(setBriefing);
      // Simulate real-time score tracking
      const interval = setInterval(() => {
        setSafetyScore(Math.floor(40 + Math.random() * 60));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [location]);

  // Extract the nearest reliable medical hub (score > 50 preferred)
  const nearestMedical = useMemo(() => {
    // Sort to prefer high safety score first, then fallback
    const medicalHubs = safeZones
      .filter(zone => zone.type === LocationType.HOSPITAL)
      .sort((a, b) => (b.safetyScore || 0) - (a.safetyScore || 0));
    
    return medicalHubs[0];
  }, [safeZones]);

  const getZoneStatus = (score: number) => {
    if (score <= 50) return { label: 'Danger Zone', color: 'bg-red-600', text: 'text-red-600', border: 'border-red-600' };
    if (score < 80) return { label: 'Semi-Danger Zone', color: 'bg-amber-500', text: 'text-amber-500', border: 'border-amber-500' };
    return { label: 'Safe Zone', color: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500' };
  };

  const status = getZoneStatus(safetyScore);

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 space-y-6 overflow-y-auto bg-blue-50">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[8px] md:text-[10px] mb-1">RSA Agent Protocol • South Africa</p>
           <h1 className="text-3xl md:text-5xl font-black italic text-blue-950 uppercase tracking-tighter">Command Hub</h1>
        </div>
        <div className={`px-4 py-2 border-2 rounded-2xl flex items-center gap-3 bg-white shadow-sm ${status.border}`}>
            <div className={`w-2 h-2 rounded-full animate-pulse ${status.color}`}></div>
            <span className={`text-[10px] font-black uppercase ${status.text}`}>{status.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tactical Briefing Card */}
        <div className="bg-blue-600 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group flex flex-col justify-center min-h-[220px]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Shield className="w-32 h-32 text-white" />
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Info className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-100">Tactical Briefing</span>
                </div>
                <p className="text-xl md:text-2xl font-black italic text-white leading-tight">"{briefing}"</p>
            </div>
        </div>

        {/* Regional Security Score Card */}
        <div className="bg-white border border-blue-200 rounded-[2.5rem] p-8 md:p-10 shadow-lg flex flex-col justify-center min-h-[220px]">
            <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                    <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest">Regional Security</h3>
                    <p className="text-[9px] text-blue-400 font-bold uppercase tracking-widest">Live location tracking: Active</p>
                </div>
                <div className="text-right">
                    <span className={`text-4xl md:text-5xl font-black italic ${status.text}`}>{safetyScore}%</span>
                </div>
            </div>
            <div className="h-4 w-full bg-blue-50 rounded-full overflow-hidden border border-blue-100 p-0.5">
                <div className={`h-full rounded-full transition-all duration-1000 ${status.color}`} style={{ width: `${safetyScore}%` }}></div>
            </div>
            <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center">
                            <Zap className="w-3 h-3 text-blue-600" />
                        </div>
                    ))}
                </div>
                <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest">Sentinel Network Syncing</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tactical Map Button */}
        <button 
          onClick={() => onNavigate('MAP')} 
          className="bg-white hover:bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-center justify-between transition-all shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Navigation className="text-blue-600 w-6 h-6" />
            </div>
            <div className="text-left">
              <span className="font-black text-blue-950 uppercase text-[10px] tracking-widest block mb-1">Network Access</span>
              <span className="font-black text-blue-950 uppercase text-xs italic">Safety Network Map</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-200 group-hover:text-blue-600 transition-colors" />
        </button>

        {/* Nearest Medical Card */}
        <div className="bg-white border border-blue-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4 overflow-hidden relative group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${nearestMedical && nearestMedical.safetyScore! <= 50 ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <Heart className={`${nearestMedical && nearestMedical.safetyScore! <= 50 ? 'text-red-500' : 'text-emerald-500'} w-6 h-6`} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-black text-blue-400 uppercase text-[9px] tracking-widest block mb-1">Reliable Medical Hub</span>
            {nearestMedical ? (
              <div className="truncate">
                <p className={`font-black uppercase text-xs italic truncate ${nearestMedical.safetyScore! <= 50 ? 'text-red-600' : 'text-blue-950'}`}>
                  {nearestMedical.name} {nearestMedical.safetyScore! <= 50 ? '(DANGER)' : ''}
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Safety Score: {nearestMedical.safetyScore}%</p>
                {nearestMedical.address && (
                  <a 
                    href={nearestMedical.address} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[8px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-1 mt-1"
                  >
                    Get Route <Navigation className="w-2 h-2" />
                  </a>
                )}
              </div>
            ) : (
              <p className="font-black text-slate-300 uppercase text-[10px] italic">Scanning assets...</p>
            )}
          </div>
        </div>

        {/* SOS Alert Button */}
        <button 
          onClick={() => onNavigate('SOS')} 
          className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-xl shadow-red-100 active:scale-95"
        >
          <AlertCircle className="w-7 h-7 animate-pulse" />
          <span className="font-black uppercase text-sm italic tracking-tight">SOS Alert</span>
        </button>
      </div>

      <div className="pt-8 border-t border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="text-blue-600 w-5 h-5" />
            </div>
            <div>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Current Sector</p>
                <p className="text-xs font-mono text-blue-950 font-bold">
                    {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Scanning...'}
                </p>
            </div>
         </div>
         <p className="text-[8px] font-black text-blue-300 uppercase tracking-[0.2em]">Republica Safety Agency • Secure Node 882</p>
      </div>
    </div>
  );
};

export default GuardianHub;
