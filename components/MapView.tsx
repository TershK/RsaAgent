
import React, { useEffect, useRef } from 'react';
import { Incident } from '../types';
import { CITY_CENTER } from '../constants';

interface MapViewProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  userLocation?: [number, number];
}

const MapView: React.FC<MapViewProps> = ({ incidents, onIncidentClick, userLocation }) => {
  // Fix: Use 'any' as Leaflet is loaded globally and types for 'L' namespace are not explicitly imported
  const mapRef = useRef<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Fix: Use 'any' as Leaflet is loaded globally and types for 'L' namespace are not explicitly imported
  const markersRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(CITY_CENTER, 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(mapRef.current);

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

    // Clear old markers that aren't in current list
    const currentIds = new Set(incidents.map(i => i.id));
    Object.keys(markersRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add/Update markers
    incidents.forEach(incident => {
      if (!markersRef.current[incident.id]) {
        const color = incident.severity === 'CRITICAL' ? '#ef4444' : incident.severity === 'HIGH' ? '#f97316' : '#3b82f6';
        
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${color};"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([incident.location.lat, incident.location.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .on('click', () => onIncidentClick?.(incident));
        
        markersRef.current[incident.id] = marker;
      }
    });

    if (userLocation) {
        const userIcon = L.divIcon({
            className: 'user-icon',
            html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 15px #10b981;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });
        L.marker(userLocation, { icon: userIcon }).addTo(mapRef.current);
    }
  }, [incidents, userLocation, onIncidentClick]);

  return (
    <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden shadow-2xl border border-slate-800" />
  );
};

export default MapView;
