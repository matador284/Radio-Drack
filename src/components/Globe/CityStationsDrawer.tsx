"use client";

import React from "react";
import { Station, City } from "@/lib/types";
import { TranslationDict } from "@/lib/translations";
import { Play, Pause, Radio, X, Heart, ExternalLink } from "lucide-react";

interface CityStationsDrawerProps {
  city: City;
  stations: Station[];
  isLoading: boolean;
  isOpen: boolean;
  currentStation: Station | null;
  isPlaying: boolean;
  onClose: () => void;
  onPlayStation: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  isFavorite: (station: Station) => boolean;
  t: TranslationDict;
}

export const CityStationsDrawer: React.FC<CityStationsDrawerProps> = ({
  city,
  stations,
  isLoading,
  isOpen,
  currentStation,
  isPlaying,
  onClose,
  onPlayStation,
  onToggleFavorite,
  isFavorite,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      aria-label={`${t.drawer.stationsIn} ${city.name}`}
      className="fixed inset-y-0 right-0 z-30 w-full sm:w-[420px] bg-[#07080c]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 animate-in slide-in-from-right"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/[0.08] flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#e8c374] uppercase">
            {t.drawer.stationsIn} {city.country}
          </div>
          <h3 className="text-2xl font-light text-white font-serif mt-0.5">
            {city.name}.
          </h3>
          <p className="text-xs text-white/40 font-mono mt-0.5">
            {stations.length} {t.drawer.frequenciesFound}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close stations list"
          className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Station List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
        {isLoading ? (
          // Skeleton loading
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] animate-pulse flex items-center gap-3.5"
            >
              <div className="w-10 h-10 rounded-lg bg-white/[0.05]" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-white/[0.08] rounded w-2/3" />
                <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
          ))
        ) : stations.length === 0 ? (
          <div className="py-16 text-center text-white/40 space-y-2">
            <Radio className="w-8 h-8 mx-auto text-white/20" />
            <p className="text-xs font-mono">{t.drawer.noStations}</p>
            <p className="text-[11px] text-white/30">{t.drawer.tryNearby}</p>
          </div>
        ) : (
          stations.map((st) => {
            const isCurrent =
              currentStation &&
              (currentStation.stationuuid === st.stationuuid ||
                currentStation.name === st.name);
            const fav = isFavorite(st);

            return (
              <div
                key={st.stationuuid || st.name}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                  isCurrent
                    ? "bg-[#e8c374]/10 border-[#e8c374]/30 shadow-[0_0_20px_rgba(232,195,116,0.15)]"
                    : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15"
                }`}
              >
                {/* Station Icon & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.08] flex-shrink-0 flex items-center justify-center">
                    {st.favicon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={st.favicon}
                        alt={st.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <Radio className="w-4 h-4 text-[#e8c374]/70" />
                    )}
                    {isCurrent && isPlaying && (
                      <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-black" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-medium text-white/95 truncate">
                        {st.name}
                      </h4>
                      {st.bitrate ? (
                        <span className="text-[9px] font-mono text-white/30 tracking-wider">
                          {st.bitrate}K
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-white/40 truncate mt-0.5">
                      {st.tags || st.language || "Eclectic"}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFavorite(st)}
                    aria-label={fav ? "Remove favorite" : "Add to favorites"}
                    className={`p-1.5 rounded-lg transition-all ${
                      fav
                        ? "text-rose-400 bg-rose-500/10"
                        : "text-white/30 hover:text-white/80 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${fav ? "fill-current" : ""}`} />
                  </button>

                  <button
                    onClick={() => onPlayStation(st)}
                    aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                      isCurrent && isPlaying
                        ? "bg-[#e8c374] text-black shadow-[0_0_12px_rgba(232,195,116,0.4)]"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    }`}
                  >
                    {isCurrent && isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/[0.06] bg-black/30 flex items-center justify-between text-[11px] font-mono text-white/30">
        <span>RADIO BROWSER API</span>
        <a
          href="https://www.radio-browser.info"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white/60 inline-flex items-center gap-1"
        >
          <span>{t.drawer.apiIndex}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </aside>
  );
};
