"use client";

import React from "react";
import { City } from "@/lib/types";
import { TranslationDict } from "@/lib/translations";
import { Compass, Sparkles, MapPin } from "lucide-react";

interface GlobeOverlayProps {
  selectedCity: City;
  onRandomCity: () => void;
  filterMode: "LOCAL" | "WORLD";
  onToggleFilterMode: () => void;
  onOpenStationList: () => void;
  t: TranslationDict;
}

export const GlobeOverlay: React.FC<GlobeOverlayProps> = ({
  selectedCity,
  onRandomCity,
  filterMode,
  onToggleFilterMode,
  onOpenStationList,
  t,
}) => {
  return (
    <div className="absolute top-24 left-6 sm:left-12 pointer-events-none z-20 max-w-sm sm:max-w-md">
      <div className="space-y-3">
        {/* Next destination header */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase bg-[#e8c374]/10 text-[#e8c374] border border-[#e8c374]/20">
            <Compass className="w-3 h-3 animate-spin-slow" />
            {t.globe.nextDestination}
          </span>
          <span className="text-[10px] font-mono text-white/30 tracking-wider">
            {selectedCity.lat.toFixed(2)}°N, {selectedCity.lng.toFixed(2)}°E
          </span>
        </div>

        {/* Big Editorial City Name with the period as required in the design spec */}
        <div>
          <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-white/95 font-serif drop-shadow-2xl">
            {selectedCity.name}.
          </h2>
          <p className="text-xs sm:text-sm font-mono tracking-widest text-white/50 uppercase mt-1">
            {selectedCity.name}, {selectedCity.country}
          </p>
        </div>

        {/* Tagline / Vibe */}
        {selectedCity.tagline && (
          <p className="text-xs text-white/40 leading-relaxed max-w-xs sm:max-w-sm drop-shadow">
            {selectedCity.tagline}
          </p>
        )}

        {/* Station Count & Status */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-mono text-[#e8c374]/90 tracking-wider">
            {selectedCity.stationCount || "80+"} {t.globe.stationsAvailable}
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="text-xs font-mono text-white/40 uppercase">{t.globe.liveFeed}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2 pointer-events-auto">
          <button
            onClick={onOpenStationList}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium tracking-wide border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-lg flex items-center gap-2"
          >
            <MapPin className="w-3.5 h-3.5 text-[#e8c374]" />
            <span>{t.globe.exploreStations}</span>
          </button>

          <button
            onClick={onRandomCity}
            className="px-4 py-2 rounded-lg bg-[#e8c374]/15 hover:bg-[#e8c374]/25 text-[#f5d382] text-xs font-medium tracking-wide border border-[#e8c374]/30 backdrop-blur-md transition-all active:scale-95 shadow-lg flex items-center gap-2 group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
            <span>{t.globe.somewhereNew}</span>
          </button>
        </div>

        {/* LOCAL / WORLD Toggle */}
        <div className="pt-2 pointer-events-auto">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => filterMode !== "LOCAL" && onToggleFilterMode()}
              className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase transition-all ${
                filterMode === "LOCAL"
                  ? "bg-[#e8c374] text-black font-semibold shadow"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              {t.globe.local}
            </button>
            <button
              onClick={() => filterMode !== "WORLD" && onToggleFilterMode()}
              className={`px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase transition-all ${
                filterMode === "WORLD"
                  ? "bg-[#e8c374] text-black font-semibold shadow"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              {t.globe.world}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
