"use client";

import React, { useState, useEffect, useRef } from "react";
import { Station, City } from "@/lib/types";
import { TranslationDict } from "@/lib/translations";
import { radioApi } from "@/lib/api";
import { WORLD_CITIES } from "@/lib/cities";
import { Search, Radio, MapPin, Play, X, Loader2 } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayStation: (station: Station) => void;
  onSelectCity: (city: City) => void;
  t: TranslationDict;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onPlayStation,
  onSelectCity,
  t,
}) => {
  const [query, setQuery] = useState("");
  const [stations, setStations] = useState<Station[]>([]);
  const [matchedCities, setMatchedCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setStations([]);
      setMatchedCities([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setStations([]);
      setMatchedCities([]);
      setIsLoading(false);
      return;
    }

    const clean = query.trim().toLowerCase();
    const foundCities = WORLD_CITIES.filter(
      (c) =>
        c.name.toLowerCase().includes(clean) ||
        c.country.toLowerCase().includes(clean) ||
        (c.primaryTag && c.primaryTag.toLowerCase().includes(clean))
    ).slice(0, 5);
    setMatchedCities(foundCities);

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await radioApi.searchStations(clean, 10);
        setStations(results);
      } catch {
        // failover
      } finally {
        setIsLoading(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#0b0e14]/95 border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="w-5 h-5 text-[#e8c374]/80 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.command.placeholder}
            aria-label={t.command.placeholder}
            className="w-full bg-transparent text-white placeholder-white/30 text-sm focus:outline-none font-mono"
          />
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#e8c374] animate-spin mr-2" />
          )}
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-md text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {!query.trim() ? (
            <div className="py-12 text-center text-white/30 space-y-2">
              <Radio className="w-8 h-8 mx-auto text-white/20" />
              <p className="text-xs font-mono tracking-widest uppercase">
                {t.command.promptTitle}
              </p>
              <p className="text-[11px] text-white/20">
                {t.command.promptSubtitle}
              </p>
            </div>
          ) : (
            <>
              {/* CITIES */}
              {matchedCities.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-[#e8c374] uppercase">
                    {t.command.cities} ({matchedCities.length})
                  </div>
                  {matchedCities.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => {
                        onSelectCity(c);
                        onClose();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <MapPin className="w-4 h-4 text-[#e8c374]/80 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-sm font-light text-white font-serif">
                            {c.name}.
                          </span>
                          <span className="text-xs text-white/40 font-mono ml-2">
                            {c.country}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-white/30 group-hover:text-white/70">
                        {t.command.flyGlobe}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* STATIONS */}
              {stations.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-sky-400 uppercase">
                    {t.command.stations} ({stations.length})
                  </div>
                  {stations.map((st) => (
                    <button
                      key={st.stationuuid || st.name}
                      onClick={() => {
                        onPlayStation(st);
                        onClose();
                      }}
                      className="w-full px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors flex items-center justify-between text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                          {st.favicon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={st.favicon}
                              alt={st.name}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <Radio className="w-3.5 h-3.5 text-[#e8c374]/80" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-white truncate group-hover:text-[#f5d382]">
                            {st.name}
                          </div>
                          <div className="text-[10px] text-white/40 truncate font-mono">
                            {[st.state, st.country].filter(Boolean).join(", ") || st.tags || "Global"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2">
                        <span className="text-[10px] font-mono text-white/30">
                          {st.bitrate ? `${st.bitrate}K` : "LIVE"}
                        </span>
                        <div className="w-7 h-7 rounded-lg bg-white/10 text-white group-hover:bg-[#e8c374] group-hover:text-black flex items-center justify-center transition-colors">
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isLoading && matchedCities.length === 0 && stations.length === 0 && (
                <div className="py-8 text-center text-white/30 text-xs font-mono">
                  {t.command.noResults(query)}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-black/40 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-white/30">
          <div className="flex items-center gap-3">
            <span>{t.command.escClose}</span>
            <span>{t.command.enterSelect}</span>
          </div>
          <span>{t.command.registry}</span>
        </div>
      </div>
    </div>
  );
};
