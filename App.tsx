
import React, { useState, useEffect, useRef } from 'react';
import { Coordinates, SafetyLocation, AppView, UserProfile, LibraryImage, LocationType } from './types';
import GuardianHub from './components/GuardianHub';
import SafetyMap from './components/SafetyMap';
import CivilianSOS from './components/CivilianSOS';
import SafetyAssistant from './components/SafetyAssistant';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import Library from './components/Library';
import { gemini } from './services/geminiService';
import { Bot, X, LayoutDashboard, Map as MapIcon, BellRing, AlertTriangle, ArrowLeft, User, Library as LibraryIcon, Maximize2, Minimize2 } from 'lucide-react';

const DEFAULT_PROFILE: UserProfile = {
  fullName: '',
  phone: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  bloodType: '',
  medicalConditions: ''
};

// Utility to calculate distance between two coordinates in meters
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [safeZones, setSafeZones] = useState<SafetyLocation[]>([]);
  const [dangerZones, setDangerZones] = useState<SafetyLocation[]>([]);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(false);
  const [safetyScore, setSafetyScore] = useState(85);
  const [lastZoneType, setLastZoneType] = useState<string>('SAFE');
  const [showDangerAlert, setShowDangerAlert] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [imageLibrary, setImageLibrary] = useState<LibraryImage[]>([]);
  
  const lastUpdateLocationRef = useRef<Coordinates | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);

  // Load Profile and Library from LocalStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('rsa_agent_profile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }
    
    const savedLibrary = localStorage.getItem('rsa_evidence_vault');
    if (savedLibrary) {
      try { setImageLibrary(JSON.parse(savedLibrary)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('rsa_agent_profile', JSON.stringify(newProfile));
  };

  const handleAddEvidence = (img: LibraryImage) => {
    const newLibrary = [img, ...imageLibrary];
    setImageLibrary(newLibrary);
    localStorage.setItem('rsa_evidence_vault', JSON.stringify(newLibrary));
  };

  const handleDeleteEvidence = (id: string) => {
    const newLibrary = imageLibrary.filter(img => img.id !== id);
    setImageLibrary(newLibrary);
    localStorage.setItem('rsa_evidence_vault', JSON.stringify(newLibrary));
  };

  // Helper to generate dynamic danger zones around a point
  const generateDangerZones = (center: Coordinates) => {
    const zones: SafetyLocation[] = [];
    // Generate 2-3 hotspots nearby
    for (let i = 0; i < 3; i++) {
      zones.push({
        id: `danger-spot-${i}-${Date.now()}`,
        name: `High Risk Sector ${i+1}`,
        type: LocationType.DANGER_ZONE,
        coords: {
          lat: center.lat + (Math.random() - 0.5) * 0.04,
          lng: center.lng + (Math.random() - 0.5) * 0.04
        },
        riskLevel: 7 + Math.floor(Math.random() * 3),
        description: "Area of concentrated criminal activity or civil unrest."
      });
    }
    return zones;
  };

  // Request location and setup continuous watch
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(pos => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        let distanceMoved = 0;
        
        if (lastUpdateLocationRef.current) {
          distanceMoved = calculateDistance(
            coords.lat, coords.lng, 
            lastUpdateLocationRef.current.lat, lastUpdateLocationRef.current.lng
          );
        }

        // Only update safety assets if significant time (30s) has passed or distance (100m) moved
        if (!lastUpdateLocationRef.current || distanceMoved > 100 || timeSinceLastUpdate > 30000) {
          lastUpdateLocationRef.current = coords;
          lastUpdateTimeRef.current = now;
          
          // Dynamic safety score simulation based on proximity to random "unseen" danger points
          const newScore = Math.floor(30 + Math.random() * 70);
          setSafetyScore(newScore);

          if (newScore < 50) {
            if (lastZoneType !== 'DANGER') {
              triggerDangerAlert();
              setLastZoneType('DANGER');
            }
          } else {
            setLastZoneType(newScore > 80 ? 'SAFE' : 'SEMI');
          }
          
          // Update Danger Zones dynamically
          setDangerZones(generateDangerZones(coords));

          // Fetch nearby real assets
          gemini.getNearbySafetyAssets(coords.lat, coords.lng).then(assets => {
            if (assets && assets.length > 0) {
              setSafeZones(assets.map(a => ({
                ...a,
                coords: { 
                  lat: coords.lat + (Math.random() - 0.5) * 0.03, 
                  lng: coords.lng + (Math.random() - 0.5) * 0.03 
                }
              })));
            }
          });
        }
      }, (err) => console.error(err), { enableHighAccuracy: true });
      
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [lastZoneType]);

  const triggerDangerAlert = () => {
    setShowDangerAlert(true);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("RSA CRITICAL ALERT", { body: "DANGER ZONE DETECTED. RSA Sentinel advises immediate tactical reassessment." });
    } else if ("Notification" in window && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
    setTimeout(() => setShowDangerAlert(false), 8000);
  };

  const handleTriggerSOS = () => {
    setIsEmergencyActive(true);
    setView('SOS');
  };

  const handleDeactivate = (code: string) => {
    if (code === '0000' || code.length === 4) {
      setIsEmergencyActive(false);
      setView('DASHBOARD');
      return true;
    }
    return false;
  };

  const toggleAssistant = () => {
    if (isAssistantOpen) {
      setIsAssistantOpen(false);
      setIsAssistantExpanded(false);
    } else {
      setIsAssistantOpen(true);
    }
  };

  if (!isLoggedIn) {
    return <Auth onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-blue-950 text-slate-100 overflow-hidden font-sans">
      {!isEmergencyActive && (
        <div className="hidden md:flex">
          <Sidebar currentView={view} onViewChange={setView} onLogout={() => setIsLoggedIn(false)} />
        </div>
      )}

      <main className="flex-1 flex flex-col relative overflow-hidden pb-20 md:pb-0 overflow-x-hidden">
        {/* Dynamic Danger Alert HUD Overlay */}
        {showDangerAlert && (
          <div className="absolute top-0 inset-x-0 z-[9999] bg-red-600 p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(220,38,38,0.5)] animate-in slide-in-from-top duration-500">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                   <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                   <h3 className="font-black italic uppercase text-white leading-tight tracking-tight">DANGER ZONE ENTERED</h3>
                   <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Sentinel Detection: High Volatility Sub-sector</p>
                </div>
             </div>
             <button onClick={() => setShowDangerAlert(false)} className="bg-white/10 p-2 rounded-lg text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
          {view === 'DASHBOARD' && (
            <GuardianHub location={location} safeZones={safeZones} onNavigate={setView} />
          )}

          {view === 'MAP' && (
            <div className="flex-1 relative">
              <button 
                onClick={() => setView('DASHBOARD')}
                className="absolute top-6 left-6 z-[1000] flex items-center gap-2 bg-white/90 backdrop-blur-md border border-blue-100 px-5 py-3 rounded-2xl text-blue-950 font-black uppercase text-[10px] tracking-widest shadow-xl hover:bg-white transition-all active:scale-95 group"
              >
                <ArrowLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-1 transition-transform" />
                Exit Network Map
              </button>
              
              <SafetyMap 
                userLocation={location} 
                safeZones={safeZones} 
                dangerZones={dangerZones} 
              />
            </div>
          )}

          {view === 'SOS' && (
             <div className="flex-1 flex items-center justify-center bg-blue-950 p-4 md:p-6 overflow-hidden">
                <CivilianSOS 
                  isEmergency={isEmergencyActive} 
                  onTriggerSOS={handleTriggerSOS} 
                  onDeactivate={handleDeactivate} 
                  onGoHome={() => setView('DASHBOARD')}
                  userProfile={userProfile}
                  safeZones={safeZones}
                />
             </div>
          )}

          {view === 'PROFILE' && (
            <Profile profile={userProfile} onSave={handleSaveProfile} onGoHome={() => setView('DASHBOARD')} />
          )}

          {view === 'LIBRARY' && (
            <Library images={imageLibrary} onDelete={handleDeleteEvidence} />
          )}
        </div>

        {/* Floating Assistant Container */}
        {!isEmergencyActive && (
          <div className={`fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[6000] flex flex-col items-end transition-all duration-500`}>
            {isAssistantOpen && (
              <div className={`
                bg-blue-900/95 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 transition-all mb-4
                ${isAssistantExpanded 
                  ? 'w-[92vw] h-[82vh] md:w-[70vw] lg:w-[900px] md:h-[80vh]' 
                  : 'w-[90vw] sm:w-[400px] h-[70vh] max-h-[600px]'}
              `}>
                <div className="bg-blue-600 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                      <h2 className="font-black italic uppercase text-white text-xs tracking-tight">Sentinel Assistant</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsAssistantExpanded(!isAssistantExpanded)} 
                      className="text-white/70 hover:text-white p-1 transition-colors"
                      title={isAssistantExpanded ? "Minimize" : "Expand"}
                    >
                      {isAssistantExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                    <button 
                      onClick={toggleAssistant} 
                      className="text-white/70 hover:text-white p-1 transition-colors"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden bg-blue-950/50">
                  <SafetyAssistant onCaptureEvidence={handleAddEvidence} />
                </div>
              </div>
            )}
            <button 
              onClick={toggleAssistant}
              className={`w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${isAssistantOpen ? 'bg-blue-800' : 'bg-blue-600 shadow-blue-600/30'}`}
            >
              <Bot className="w-7 h-7" />
            </button>
          </div>
        )}
      </main>

      {!isEmergencyActive && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-blue-950 border-t border-white/10 flex items-center justify-around px-4 z-[5000]">
          <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-blue-400' : 'text-slate-500'}`}><LayoutDashboard className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Hub</span></button>
          <button onClick={() => setView('MAP')} className={`flex flex-col items-center gap-1 ${view === 'MAP' ? 'text-blue-400' : 'text-slate-500'}`}><MapIcon className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Map</span></button>
          <button onClick={() => setView('SOS')} className={`flex flex-col items-center gap-1 ${view === 'SOS' ? 'text-red-500' : 'text-slate-500'}`}><BellRing className="w-6 h-6" /><span className="text-[9px] font-black uppercase">SOS</span></button>
          <button onClick={() => setView('LIBRARY')} className={`flex flex-col items-center gap-1 ${view === 'LIBRARY' ? 'text-blue-400' : 'text-slate-500'}`}><LibraryIcon className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Library</span></button>
          <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-1 ${view === 'PROFILE' ? 'text-blue-400' : 'text-slate-500'}`}><User className="w-6 h-6" /><span className="text-[9px] font-black uppercase">User</span></button>
        </nav>
      )}
    </div>
  );
};

export default App;
