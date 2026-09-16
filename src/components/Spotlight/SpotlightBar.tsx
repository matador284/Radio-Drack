"use client";

import React from "react";
import { Station } from "@/lib/types";
import { Play, Pause, Radio, Flame } from "lucide-react";

interface SpotlightBarProps {
  stations: Station[];
  currentStation: Station | null;
  isPlaying: boolean;
  onPlayStation: (station: Station) => void;
}

export const SpotlightBar: React.FC<SpotlightBarProps> = ({
  stations,
  currentStation,
  isPlaying,
  onPlayStation,
}) => {
  return (
    <div className="absolute bottom-24 left-6 sm:left-12 right-6 sm:right-auto z-20 pointer-events-auto">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase text-white/50">
          <Flame className="w-3 h-3 text-[#e8c374]" />
          SPOTLIGHT · CURATED FREQUENCIES
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full sm:max-w-2xl no-scrollbar">
        {stations.slice(0, 5).map((station) => {
          const isCurrent =
            currentStation &&
            (currentStation.stationuuid === station.stationuuid ||
              currentStation.name === station.name);

          return (
            <button
              key={station.stationuuid || station.name}
              onClick={() => onPlayStation(station)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border backdrop-blur-xl transition-all active:scale-95 flex-shrink-0 group ${
                isCurrent
                  ? "bg-[#e8c374]/15 border-[#e8c374]/40 text-[#f5d382] shadow-[0_0_15px_rgba(232,195,116,0.2)]"
                  : "bg-black/50 border-white/[0.08] text-white/70 hover:bg-white/[0.06] hover:border-white/20 hover:text-white"
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-white/[0.06] flex items-center justify-center flex-shrink-0">
                {isCurrent && isPlaying ? (
                  <Pause className="w-3 h-3 fill-current text-[#e8c374]" />
                ) : (
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                )}
              </div>

              <div className="text-left">
                <div className="text-xs font-medium tracking-tight truncate max-w-[120px]">
                  {station.name}
                </div>
                <div className="text-[10px] font-mono text-white/40 truncate max-w-[120px]">
                  {station.state || station.country}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
