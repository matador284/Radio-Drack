"use client";

import React, { useEffect, useRef, useState } from "react";
import { City, Station } from "@/lib/types";
import { TranslationDict } from "@/lib/translations";
import { Globe, Crosshair, ZoomIn, ZoomOut, Radio, Play, Pause, Navigation, MapPin } from "lucide-react";
import L from "leaflet";

interface StreetMapViewProps {
  city: City;
  stations: Station[];
  currentStation: Station | null;
  isPlaying: boolean;
  onPlayStation: (station: Station) => void;
  onReturnToGlobe: () => void;
  t: TranslationDict;
}

export const StreetMapView: React.FC<StreetMapViewProps> = ({
  city,
  stations,
  currentStation,
  isPlaying,
  onPlayStation,
  onReturnToGlobe,
  t,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const labelsTileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapMode, setMapMode] = useState<"satellite" | "dark">("satellite");
  const [zoomLevel, setZoomLevel] = useState(14);
  const [coords, setCoords] = useState({ lat: city.lat, lng: city.lng });

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Leaflet map
    const map = L.map(mapContainerRef.current, {
      center: [city.lat, city.lng],
      zoom: 14,
      minZoom: 4,
      maxZoom: 19,
      zoomControl: false,
    });

    // 1. Google Earth Style Satellite Imagery (Esri World Imagery - 100% Free, No API Key)
    const satLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; Maxar, Earthstar Geographics',
        maxZoom: 19,
      }
    );

    // 2. High-Res Streets, Avenues & Place Names Overlay
    const labelsLayer = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "",
        maxZoom: 19,
      }
    );

    satLayer.addTo(map);
    labelsLayer.addTo(map);
    baseTileLayerRef.current = satLayer;
    labelsTileLayerRef.current = labelsLayer;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    map.on("zoomend", () => {
      setZoomLevel(map.getZoom());
    });

    map.on("move", () => {
      const c = map.getCenter();
      setCoords({ lat: c.lat, lng: c.lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Switch between Satellite (Google Earth) and Dark Vector Map
  const toggleMapStyle = (mode: "satellite" | "dark") => {
    const map = mapInstanceRef.current;
    if (!map) return;

    setMapMode(mode);

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }
    if (labelsTileLayerRef.current) {
      map.removeLayer(labelsTileLayerRef.current);
      labelsTileLayerRef.current = null;
    }

    if (mode === "satellite") {
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a> &copy; Maxar, Earthstar Geographics',
          maxZoom: 19,
        }
      ).addTo(map);

      const labelsLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "",
          maxZoom: 19,
        }
      ).addTo(map);

      baseTileLayerRef.current = satLayer;
      labelsTileLayerRef.current = labelsLayer;
    } else {
      const darkLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: "abc",
        maxZoom: 19,
        className: "dark-osm-tiles",
      }).addTo(map);

      baseTileLayerRef.current = darkLayer;
    }
  };

  // Fly to city when city changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo([city.lat, city.lng], 13, { duration: 1.5 });
  }, [city]);

  // Update Markers for city center and stations
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // 1. City Center Pulsing Radar Marker
    const radarIcon = L.divIcon({
      className: "custom-radar-marker",
      html: `
        <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:rgba(232,195,116,0.25); border:1px solid #e8c374; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width:14px; height:14px; border-radius:50%; background:#e8c374; box-shadow:0 0 15px #e8c374; border:2px solid #000;"></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    L.marker([city.lat, city.lng], { icon: radarIcon })
      .addTo(markersLayer)
      .bindPopup(
        `<div style="font-family:sans-serif; padding:4px; color:#fff; background:#0b0e14;">
          <div style="font-size:10px; color:#e8c374; font-family:monospace; text-transform:uppercase;">CENTRO GPS · ${city.country}</div>
          <div style="font-size:14px; font-weight:bold; margin-top:2px;">${city.name}</div>
          <div style="font-size:11px; color:#aaa; margin-top:2px;">${city.tagline || "Área Metropolitana"}</div>
        </div>`,
        { className: "custom-dark-popup" }
      );

    // 2. Station Markers scattered around realistic city points
    stations.slice(0, 15).forEach((st, idx) => {
      // Deterministic offset per station so they distribute across city streets
      const angle = (idx / 15) * Math.PI * 2;
      const dist = 0.008 + (idx % 4) * 0.007;
      const stLat = city.lat + Math.sin(angle) * dist;
      const stLng = city.lng + Math.cos(angle) * dist * 1.2;

      const isCurrent =
        currentStation &&
        (currentStation.stationuuid === st.stationuuid || currentStation.name === st.name);

      const stIcon = L.divIcon({
        className: "custom-station-pin",
        html: `
          <div style="position:relative; width:30px; height:30px; border-radius:8px; background:${
            isCurrent ? "#e8c374" : "rgba(15,20,28,0.9)"
          }; border:1px solid ${
            isCurrent ? "#f5d382" : "rgba(255,255,255,0.2)"
          }; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.6); cursor:pointer;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${
              isCurrent ? "#000" : "#e8c374"
            }" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="2"/>
              <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
            </svg>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const popupDiv = document.createElement("div");
      popupDiv.style.color = "#fff";
      popupDiv.style.fontFamily = "sans-serif";
      popupDiv.style.padding = "4px";
      popupDiv.innerHTML = `
        <div style="font-size:10px; color:#e8c374; font-family:monospace; text-transform:uppercase;">ESTAÇÃO DE RÁDIO · GPS</div>
        <div style="font-size:13px; font-weight:bold; margin-top:2px;">${st.name}</div>
        <div style="font-size:11px; color:#888; margin-top:1px;">${st.tags || city.name}</div>
        <div style="font-size:10px; color:#4fd1c5; font-family:monospace; margin-top:2px;">${st.bitrate ? `${st.bitrate} KBPS` : "AO VIVO"}</div>
        <button id="btn-play-${idx}" style="margin-top:8px; width:100%; padding:6px; background:#e8c374; color:#000; font-size:11px; font-weight:bold; border:none; border-radius:6px; cursor:pointer;">
          ▶ SINTONIZAR AGORA
        </button>
      `;

      const marker = L.marker([stLat, stLng], { icon: stIcon }).addTo(markersLayer);
      marker.bindPopup(popupDiv, { className: "custom-dark-popup" });

      marker.on("popupopen", () => {
        const btn = document.getElementById(`btn-play-${idx}`);
        if (btn) {
          btn.onclick = () => {
            onPlayStation(st);
            marker.closePopup();
          };
        }
      });
    });
  }, [city, stations, currentStation, isPlaying, onPlayStation]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleRecenter = () => mapInstanceRef.current?.flyTo([city.lat, city.lng], 14);

  return (
    <div className="relative w-full h-full bg-[#050608] overflow-hidden select-none">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* GPS Telemetry HUD on Top Left */}
      <div className="absolute top-20 left-6 sm:left-12 z-20 pointer-events-none max-w-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#07080c]/90 border border-[#e8c374]/30 backdrop-blur-xl shadow-lg">
          <Crosshair className="w-3.5 h-3.5 text-[#e8c374] animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-[#f5d382] uppercase">
            MODO GPS · RUAS & AVENIDAS
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#07080c]/85 border border-white/10 backdrop-blur-2xl shadow-2xl space-y-1">
          <div className="text-[10px] font-mono text-[#e8c374] uppercase tracking-wider">
            LOCALIZAÇÃO RASTREADA
          </div>
          <h2 className="text-2xl font-light text-white font-serif">
            {city.name}, {city.country}
          </h2>
          <p className="text-xs font-mono text-white/50">
            {coords.lat.toFixed(4)}°N, {coords.lng.toFixed(4)}°E · ZOOM {zoomLevel}x
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-white/40 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Navegação com nomes de ruas e bairros ativa</span>
          </div>
        </div>
      </div>

      {/* Floating Controls on Top Right / Responsive */}
      <div className="absolute top-20 right-4 sm:right-8 z-20 flex flex-col gap-2 pointer-events-auto items-end">
        {/* Return to NASA Globe button */}
        <button
          onClick={onReturnToGlobe}
          className="flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#e8c374] hover:bg-[#f5d382] text-black text-xs font-mono font-semibold tracking-wider uppercase shadow-[0_0_25px_rgba(232,195,116,0.35)] transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-white"
        >
          <Globe className="w-4 h-4" />
          <span>Voltar ao Globo</span>
        </button>

        {/* Map Style Switcher (Google Earth Satellite vs Dark Vector) */}
        <div className="flex items-center rounded-xl bg-[#07080c]/90 border border-white/10 backdrop-blur-xl p-1 shadow-lg">
          <button
            onClick={() => toggleMapStyle("satellite")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono tracking-wider transition-all ${
              mapMode === "satellite"
                ? "bg-[#e8c374] text-black font-semibold shadow"
                : "text-white/60 hover:text-white"
            }`}
            title="Visualizar satélite realista estilo Google Earth com ruas"
          >
            🛰️ Satélite
          </button>
          <button
            onClick={() => toggleMapStyle("dark")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono tracking-wider transition-all ${
              mapMode === "dark"
                ? "bg-[#e8c374] text-black font-semibold shadow"
                : "text-white/60 hover:text-white"
            }`}
            title="Visualizar mapa escuro de ruas OpenStreetMap"
          >
            🗺️ Escuro
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Recenter button */}
          <button
            onClick={handleRecenter}
            title="Recentralizar no ponto de rádio"
            className="p-2.5 rounded-xl bg-[#07080c]/85 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 backdrop-blur-xl transition-all shadow flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#e8c374]"
          >
            <Navigation className="w-4 h-4 text-[#e8c374]" />
          </button>

          {/* Zoom Controls */}
          <div className="flex rounded-xl overflow-hidden bg-[#07080c]/85 border border-white/10 backdrop-blur-xl shadow">
            <button
              onClick={handleZoomIn}
              title="Aproximar ruas"
              className="p-2.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border-r border-white/[0.06] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#e8c374]"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Afastar mapa"
              className="p-2.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#e8c374]"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Custom Popup and Tile Filters */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: rgba(11, 14, 20, 0.96) !important;
          border: 1px solid rgba(232, 195, 116, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8) !important;
        }
        .leaflet-popup-tip {
          background: rgba(11, 14, 20, 0.96) !important;
        }
        .leaflet-container {
          background: #050608 !important;
        }
        .dark-osm-tiles {
          filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(90%) !important;
        }
      `}</style>
    </div>
  );
};
