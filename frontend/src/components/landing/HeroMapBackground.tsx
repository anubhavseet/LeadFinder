import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export const HeroMapBackground: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered on a dense metropolitan street grid (Austin, TX downtown & commercial sectors)
    const map = L.map(mapContainerRef.current, {
      center: [30.2672, -97.7431],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    });

    mapInstanceRef.current = map;

    // ESRI World Light Gray Canvas Base — clean, professional, authentic cartographic street map
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Esri, HERE, Garmin, OpenStreetMap contributors',
    }).addTo(map);

    // ESRI World Light Gray Reference — crisp street names, avenue labels, district boundaries
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      opacity: 0.85,
    }).addTo(map);

    // Subtle gentle pan animation to keep the map alive
    let angle = 0;
    const panTimer = setInterval(() => {
      if (!mapInstanceRef.current) return;
      angle += 0.015;
      const lat = 30.2672 + Math.sin(angle) * 0.005;
      const lng = -97.7431 + Math.cos(angle) * 0.007;
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 3.5 });
    }, 3500);

    return () => {
      clearInterval(panTimer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden select-none z-0">
      {/* Real Cartographic Tile Map Layer */}
      <div ref={mapContainerRef} className="w-full h-full opacity-75 filter contrast-[1.05]" />

      {/* Soft gradient masks to blend cleanly with navbar and content */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#F7F8FA] via-[#F7F8FA]/60 to-transparent z-10" />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#F7F8FA] via-[#F7F8FA]/70 to-transparent z-10" />
    </div>
  );
};
