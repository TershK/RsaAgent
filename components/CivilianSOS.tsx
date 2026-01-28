
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, Lock, Unlock, Navigation, Volume2, VolumeX, Home, UserCheck, PhoneOutgoing } from 'lucide-react';
import { IncidentType, IncidentSeverity, IncidentStatus, SafetyLocation, UserProfile } from '../types';

interface CivilianSOSProps {
  onTriggerSOS: (incident: any) => void;
  isEmergency: boolean;
  onDeactivate: (code: string) => boolean;
  onGoHome?: () => void;
  userProfile?: UserProfile;
  safeZones: SafetyLocation[];
}

const CivilianSOS: React.FC<CivilianSOSProps> = ({ 
  onTriggerSOS, 
  isEmergency, 
  onDeactivate, 
  onGoHome, 
  userProfile,
  safeZones 
}) => {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [unlockCodeInput, setUnlockCodeInput] = useState('');
  const [flash, setFlash] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  useEffect(() => {
    let flashInterval: any;
    if (isEmergency) {
      flashInterval = setInterval(() => setFlash(f => !f), 200);
      if (!isSirenMuted) startSiren();
    } else {
      stopSiren();
    }
    return () => {
      clearInterval(flashInterval);
      stopSiren();
    };
  }, [isEmergency, isSirenMuted]);

  useEffect(() => {
    if (isPressing) {
      const interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            handleTrigger();
            return 100;
          }
          return p + 4;
        });
      }, 50);
      return () => clearInterval(interval);
    } else {
      setProgress(0);
    }
  }, [isPressing]);

  const startSiren = () => {
    if (sirenIntervalRef.current) return;
    
    const playTone = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.8);
      
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    };

    playTone();
    sirenIntervalRef.current = setInterval(playTone, 1000);
  };

  const stopSiren = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
  };

  const handleTrigger = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    onTriggerSOS({
      id: Date.now().toString(),
      type: IncidentType.SOS,
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.REPORTED,
      location: location || { lat: 34.0522, lng: -118.2437 },
      timestamp: new Date().toISOString(),
      description: `EMERGENCY: SOS SIGNAL DEPLOYED BY ${userProfile?.fullName || 'UNKNOWN USER'}`,
      confidence: 1.0,
      unlockCode: code
    });
    setIsPressing(false);
  };

  const HomeButton = () => (
    <button 
      onClick={onGoHome}
      className={`absolute top-6 left-6 z-[10001] w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-90 backdrop-blur-xl border-2 shadow-lg ${
        isEmergency 
          ? (flash ? 'bg-white/10 border-white/20 text-white' : 'bg-slate-900/10 border-slate-900/20 text-slate-900')
          : 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
      }`}
      title="Home Hub"
    >
      <Home className="w-6 h-6" />
    </button>
  );

  if (isEmergency) {
    return (
      <div className={`fixed inset-0 z-[10000] flex flex-col transition-colors duration-200 overflow-x-hidden overflow-y-auto ${flash ? 'bg-red-600' : 'bg-white'}`}>
        <HomeButton />

        <div className="flex-1 w-full max-w-md mx-auto px-6 flex flex-col items-center justify-start space-y-6 pt-20 pb-12 overflow-x-hidden">
          <AlertTriangle className={`w-20 h-20 md:w-24 md:h-24 ${flash ? 'text-white' : 'text-red-600'} animate-bounce shrink-0`} />
          
          <div className="text-center space-y-1">
            <h1 className={`text-4xl font-black italic tracking-tighter uppercase ${flash ? 'text-white' : 'text-red-600'}`}>
              SOS Active
            </h1>
            <p className={`font-black text-[10px] tracking-widest ${flash ? 'text-white/80' : 'text-slate-900'}`}>
              SIREN PULSING • GPS TRACKING
            </p>
          </div>

          <div className="w-full bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-[2rem] p-5 flex flex-col items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center animate-pulse">
                <PhoneOutgoing className="w-5 h-5 text-red-600" />
             </div>
             <div className="text-center min-w-0 w-full">
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${flash ? 'text-white/70' : 'text-slate-500'}`}>Notifying SOS Contact</p>
                <h3 className={`text-base font-black italic uppercase leading-none truncate ${flash ? 'text-white' : 'text-slate-900'}`}>
                  {userProfile?.emergencyContactName || 'NO CONTACT SET'}
                </h3>
                <p className={`text-[11px] font-mono font-bold mt-1 ${flash ? 'text-white/60' : 'text-slate-400'}`}>
                   {userProfile?.emergencyContactPhone || '000-000-0000'}
                </p>
             </div>
          </div>

          <button 
            onClick={() => setIsSirenMuted(!isSirenMuted)}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase text-xs border-4 transition-all shrink-0 ${
              isSirenMuted 
                ? 'bg-white text-red-600 border-red-600' 
                : 'bg-red-600 text-white border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]'
            }`}
          >
            {isSirenMuted ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            {isSirenMuted ? 'Start Siren' : 'Stop Siren'}
          </button>

          <div className="w-full bg-black/90 backdrop-blur-md rounded-[2rem] p-5 border border-white/20 space-y-3 shadow-2xl overflow-hidden">
             <h2 className="text-white font-black uppercase text-[9px] tracking-[0.2em] flex items-center gap-2 mb-1">
                <Navigation className="w-3.5 h-3.5 text-blue-500" /> Proximal Safe Points
             </h2>
             <div className="space-y-2">
                {safeZones.length > 0 ? safeZones.slice(0, 3).map((zone, i) => (
                  <a key={i} href={zone.address} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                       <span className="text-white text-[11px] font-bold truncate pr-2">{zone.name}</span>
                       <Navigation className="w-4 h-4 text-blue-400 shrink-0" />
                  </a>
                )) : (
                  <div className="flex flex-col items-center py-2 gap-2">
                    <div className="w-3 h-3 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-white/40 text-[9px] uppercase font-bold tracking-widest">Scanning Local Hubs...</span>
                  </div>
                )}
             </div>
          </div>

          <div className="w-full bg-white p-5 rounded-[2rem] shadow-2xl space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-slate-400 font-black uppercase text-[8px] tracking-widest">Responder Secure Access</span>
                <Lock className="w-3 h-3 text-slate-300" />
             </div>
             <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="CODE"
                  className="flex-1 min-w-0 bg-slate-100 rounded-xl px-4 py-3 text-center text-xl font-black text-slate-900 focus:outline-none border-2 border-transparent focus:border-red-600 transition-all placeholder:text-slate-200"
                  value={unlockCodeInput}
                  onChange={(e) => setUnlockCodeInput(e.target.value)}
                />
                <button 
                  onClick={() => {
                    if (onDeactivate(unlockCodeInput)) {
                        setUnlockCodeInput('');
                    } else {
                        alert("INVALID AUTH CODE");
                    }
                  }}
                  className="bg-red-600 text-white px-5 rounded-xl hover:bg-red-700 transition-colors shadow-lg flex items-center justify-center shrink-0"
                >
                  <Unlock className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-full min-h-[600px] flex flex-col bg-slate-950 rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden relative group">
      <HomeButton />

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none"></div>
      
      <div className="p-8 flex flex-col items-center justify-center space-y-8 flex-1 overflow-x-hidden">
          <div className="text-center space-y-2 pt-12">
            <h2 className="text-white text-3xl md:text-4xl font-black tracking-tighter italic uppercase leading-none">Panic Button</h2>
            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em]">Hold 2s for Tactical Response</p>
          </div>

          <div className="relative shrink-0">
            <div className={`absolute inset-0 bg-red-600 rounded-full transition-all duration-700 ${isPressing ? 'scale-150 opacity-20' : 'scale-110 opacity-10 animate-ping'}`}></div>
            
            <button
                onMouseDown={() => setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                onTouchStart={() => setIsPressing(true)}
                onTouchEnd={() => setIsPressing(false)}
                className={`relative w-44 h-44 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center shadow-[0_20px_60px_rgba(220,38,38,0.3)] transition-all duration-300 ${isPressing ? 'scale-95 bg-red-700' : 'bg-red-600'}`}
            >
                <div className="absolute inset-3 rounded-full border-4 border-white/10"></div>
                <svg className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" r="118" fill="transparent" stroke="white" strokeWidth="12" strokeDasharray="741.4" strokeDashoffset={741.4 - (741.4 * progress) / 100} className="transition-all duration-75" />
                </svg>
                <AlertTriangle className="w-12 h-12 md:w-16 md:h-16 text-white mb-2 drop-shadow-lg" />
                <span className="text-white font-black text-3xl md:text-4xl italic uppercase tracking-tighter">SOS</span>
            </button>
          </div>

          {userProfile?.fullName && (
            <div className="w-full bg-white/5 border border-white/5 p-3.5 rounded-2xl flex items-center gap-3">
               <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck className="w-4 h-4 text-white" />
               </div>
               <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Profile</p>
                  <p className="text-white font-bold text-xs truncate">{userProfile.fullName}</p>
               </div>
            </div>
          )}
      </div>
      
      <div className="p-4 bg-slate-900/60 border-t border-white/5 flex items-center justify-center gap-2 mt-auto">
        <MapPin className="w-3 h-3 text-red-500 animate-pulse" />
        <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.3em] truncate">
            {location ? `GPS: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Scanning Sector...'}
        </p>
      </div>
    </div>
  );
};

export default CivilianSOS;
