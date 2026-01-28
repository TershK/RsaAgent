
import React, { useEffect, useRef } from 'react';
import { SafetyLocation, LocationType, Coordinates } from '../types';

interface SafetyMapProps {
  userLocation: Coordinates | null;
  safeZones: SafetyLocation[];
  dangerZones: SafetyLocation[];
  onZoneClick?: (zone: SafetyLocation) => void;
}

const SafetyMap: React.FC<SafetyMapProps> = ({ userLocation, safeZones, dangerZones, onZoneClick }) => {
  const mapRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const regionsRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Tactical dark theme for the map
    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.1
    }).setView([-26.2041, 28.0473], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(mapRef.current);

    // Custom zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!mapRef.current || !L) return;

    // Clear old markers and circles
    Object.values(markersRef.current).forEach((m: any) => m?.remove());
    Object.values(regionsRef.current).forEach((r: any) => r?.remove());
    markersRef.current = {};
    regionsRef.current = {};

    // User Tracker Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'user-pin-tactical',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-16 h-16 bg-blue-500/20 rounded-full animate-ping"></div>
            <div class="absolute w-12 h-12 bg-blue-600/30 rounded-full animate-pulse"></div>
            <div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-[0_0_20px_rgba(37,99,235,0.6)] relative z-10 flex items-center justify-center">
                <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        `,
        iconSize: [64, 64],
        iconAnchor: [32, 32]
      });
      
      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(mapRef.current);
        
      markersRef.current['user'] = userMarker;
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 1.5 });

      // Add user coverage circle
      const userCircle = L.circle([userLocation.lat, userLocation.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.05,
        weight: 1,
        dashArray: '5, 5',
        radius: 1200
      }).addTo(mapRef.current);
      regionsRef.current['user-range'] = userCircle;
    }

    // Render Danger Zones (Live Heatspots)
    dangerZones.forEach((zone, idx) => {
      const radius = 800 + (Math.random() * 400);
      
      const dangerIcon = L.divIcon({
        className: 'danger-zone-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-12 h-12 bg-red-600/40 rounded-full animate-ping"></div>
            <div class="w-10 h-10 bg-red-600 rounded-xl border-2 border-white shadow-2xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/></svg>
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      const marker = L.marker([zone.coords.lat, zone.coords.lng], { icon: dangerIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-3 bg-slate-900 text-white rounded-xl border border-red-500/30">
            <h3 class="font-black uppercase italic text-sm text-red-500 mb-1">${zone.name}</h3>
            <p class="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-2">CRITICAL RISK LEVEL: ${zone.riskLevel}/10</p>
            <p class="text-[9px] text-slate-400 font-medium leading-relaxed italic border-t border-white/5 pt-2">${zone.description}</p>
          </div>
        `, { className: 'tactical-popup' });
      
      const dangerCircle = L.circle([zone.coords.lat, zone.coords.lng], {
        color: '#dc2626',
        fillColor: '#dc2626',
        fillOpacity: 0.15,
        weight: 2,
        radius: radius
      }).addTo(mapRef.current);

      markersRef.current[zone.id] = marker;
      regionsRef.current[`${zone.id}-circle`] = dangerCircle;
    });

    // Render Safe Hub Assets
    safeZones.forEach(zone => {
      const isLowScore = (zone.safetyScore !== undefined && zone.safetyScore <= 50);
      const iconColor = isLowScore ? '#f59e0b' : '#10b981';
      
      const assetIcon = L.divIcon({
        className: 'safe-hub-icon',
        html: `
          <div class="group relative flex items-center justify-center">
            <div style="background-color: ${iconColor}" class="w-8 h-8 rounded-lg border-2 border-white shadow-lg flex items-center justify-center transition-all hover:scale-125 hover:rotate-12">
               ${zone.type === LocationType.HOSPITAL 
                 ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.044 3 5.5L12 21l7-7Z"/></svg>`
                 : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`
               }
            </div>
            <div class="absolute -bottom-6 bg-slate-900 text-[8px] font-black text-white px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
               ${zone.name}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([zone.coords.lat, zone.coords.lng], { icon: assetIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div class="p-3 bg-slate-900 text-white rounded-xl border border-blue-500/30">
            <h3 class="font-black uppercase italic text-sm text-blue-400 mb-1">${zone.name}</h3>
            <div class="flex items-center gap-2 mb-2">
              <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
                ${zone.type} Node
              </span>
              <span class="text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${isLowScore ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}">
                Score: ${zone.safetyScore}%
              </span>
            </div>
            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest border-t border-white/5 pt-2">${zone.description || 'Verified Public Safety Asset'}</p>
          </div>
        `, { className: 'tactical-popup' });
        
      markersRef.current[zone.id] = marker;

      // Add a small safe zone radius around hospitals/police
      const safeCircle = L.circle([zone.coords.lat, zone.coords.lng], {
        color: iconColor,
        fillColor: iconColor,
        fillOpacity: 0.05,
        weight: 1,
        radius: 400
      }).addTo(mapRef.current);
      regionsRef.current[`${zone.id}-safe-range`] = safeCircle;
    });

  }, [userLocation, safeZones, dangerZones]);

  return (
    <div className="w-full h-full relative">
        <div ref={containerRef} className="w-full h-full bg-slate-950" />
        
        {/* Tactical Overlay Elements */}
        <div className="absolute top-6 right-6 z-[1001] bg-slate-900/80 backdrop-blur-md border border-white/10 p-4 rounded-3xl shadow-2xl pointer-events-none">
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Active Danger Zones</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Safe Hub Network</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border border-white"></div>
                    <span className="text-[10px] font-black uppercase text-white tracking-widest">User Signal</span>
                </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] italic">RSA Sentinel System v4.2</p>
            </div>
        </div>

        {/* Dynamic scanning line effect overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1002] opacity-10">
            <div className="w-full h-32 bg-gradient-to-b from-blue-500/50 to-transparent -translate-y-full animate-[scan_6s_linear_infinite]"></div>
        </div>

        <style>{`
            @keyframes scan {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100vh); }
            }
            .tactical-popup .leaflet-popup-content-wrapper {
                background: transparent !important;
                box-shadow: none !important;
                padding: 0 !important;
            }
            .tactical-popup .leaflet-popup-tip {
                display: none;
            }
        `}</style>
    </div>
  );
};

export default SafetyMap;
