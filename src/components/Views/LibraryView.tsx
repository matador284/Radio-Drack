"use client";

import React, { useState } from "react";
import { Station, City } from "@/lib/types";
import { Play, Pause, Heart, Radio, MapPin, Trash2, Clock, Bookmark, Sparkles } from "lucide-react";

interface LibraryViewProps {
  favorites: Station[];
  history: Station[];
  visitedCities: string[];
  currentStation: Station | null;
  isPlaying: boolean;
  onPlayStation: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  onSelectCityByName?: (cityName: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  favorites,
  history,
  visitedCities,
  currentStation,
  isPlaying,
  onPlayStation,
  onToggleFavorite,
  onSelectCityByName,
}) => {
  const [activeTab, setActiveTab] = useState<"favorites" | "history" | "cities">("favorites");

  return (
    <div className="w-full min-h-screen pt-24 pb-36 px-6 sm:px-12 max-w-7xl mx-auto space-y-8">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-white/[0.08] pb-6">
        <div className="flex items-center gap-2 text-[#e8c374] text-xs font-mono tracking-widest uppercase">
          <Bookmark className="w-3.5 h-3.5" />
          <span>PERSONAL FREQUENCIES</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-light text-white/95 font-serif tracking-tight">
          Library.
        </h1>
        <p className="text-sm text-white/40 max-w-xl font-mono tracking-wide">
          Your saved broadcasts, recent transmissions, and logged coordinates across the globe.
        </p>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 pt-6">
          <button
            onClick={() => setActiveTab("favorites")}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "favorites"
                ? "bg-[#e8c374] text-black font-semibold shadow-[0_0_15px_rgba(232,195,116,0.3)]"
                : "bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.06]"
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>FAVORITES ({favorites.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-[#e8c374] text-black font-semibold shadow-[0_0_15px_rgba(232,195,116,0.3)]"
                : "bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.06]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>RECENTLY PLAYED ({history.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("cities")}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "cities"
                ? "bg-[#e8c374] text-black font-semibold shadow-[0_0_15px_rgba(232,195,116,0.3)]"
                : "bg-white/[0.03] text-white/50 hover:text-white border border-white/[0.06]"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>CITIES VISITED ({visitedCities.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content: Favorites */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="py-24 text-center text-white/30 space-y-3">
              <Heart className="w-10 h-10 mx-auto text-white/10" />
              <p className="text-sm font-mono uppercase tracking-widest">No saved stations yet</p>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                Click the heart icon on any station while exploring the globe or discover shelves to store it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {favorites.map((st) => {
                const isCurrent =
                  currentStation &&
                  (currentStation.stationuuid === st.stationuuid ||
                    currentStation.name === st.name);

                return (
                  <div
                    key={st.stationuuid || st.name}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                      isCurrent
                        ? "bg-[#e8c374]/10 border-[#e8c374]/40 shadow-[0_0_20px_rgba(232,195,116,0.15)]"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
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
                          <Radio className="w-5 h-5 text-[#e8c374]/70" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {st.name}
                        </h4>
                        <p className="text-xs text-white/40 truncate font-mono mt-0.5">
                          {[st.state, st.country].filter(Boolean).join(", ") || "World Stream"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleFavorite(st)}
                        aria-label="Remove favorite"
                        className="p-2 rounded-lg text-rose-400 hover:text-white/40 transition-colors"
                        title="Remove from favorites"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        onClick={() => onPlayStation(st)}
                        aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                          isCurrent && isPlaying
                            ? "bg-[#e8c374] text-black shadow-[0_0_15px_rgba(232,195,116,0.3)]"
                            : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                        }`}
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: History */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="py-24 text-center text-white/30 space-y-3">
              <Clock className="w-10 h-10 mx-auto text-white/10" />
              <p className="text-sm font-mono uppercase tracking-widest">Listening history is clear</p>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                Tune into any radio to start recording your personal transmission timeline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((st) => {
                const isCurrent =
                  currentStation &&
                  (currentStation.stationuuid === st.stationuuid ||
                    currentStation.name === st.name);

                return (
                  <div
                    key={st.stationuuid || st.name}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 group ${
                      isCurrent
                        ? "bg-[#e8c374]/10 border-[#e8c374]/40 shadow-[0_0_20px_rgba(232,195,116,0.15)]"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <div className="w-11 h-11 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
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
                          <Radio className="w-5 h-5 text-[#e8c374]/70" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-white truncate">
                          {st.name}
                        </h4>
                        <p className="text-xs text-white/40 truncate font-mono mt-0.5">
                          {[st.state, st.country].filter(Boolean).join(", ") || "World Stream"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onPlayStation(st)}
                      aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                        isCurrent && isPlaying
                          ? "bg-[#e8c374] text-black shadow-[0_0_15px_rgba(232,195,116,0.3)]"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Visited Cities */}
      {activeTab === "cities" && (
        <div className="space-y-4">
          {visitedCities.length === 0 ? (
            <div className="py-24 text-center text-white/30 space-y-3">
              <MapPin className="w-10 h-10 mx-auto text-white/10" />
              <p className="text-sm font-mono uppercase tracking-widest">No cities visited yet</p>
              <p className="text-xs text-white/40 max-w-sm mx-auto">
                Navigate the 3D globe to log travel destinations in your personal radio passport.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visitedCities.map((cityName) => (
                <button
                  key={cityName}
                  onClick={() => onSelectCityByName && onSelectCityByName(cityName)}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.05] hover:border-[#e8c374]/30 transition-all text-left group"
                >
                  <div className="flex items-center justify-between text-white/30 group-hover:text-[#e8c374] transition-colors mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-[10px] font-mono tracking-widest uppercase">VISITED</span>
                  </div>
                  <h4 className="text-base font-light text-white font-serif group-hover:text-[#f5d382] transition-colors">
                    {cityName}.
                  </h4>
                  <p className="text-[11px] font-mono text-white/40 mt-1">Jump to on globe →</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
