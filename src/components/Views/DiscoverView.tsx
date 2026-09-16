"use client";

import React, { useState, useEffect } from "react";
import { Station } from "@/lib/types";
import { TranslationDict } from "@/lib/translations";
import { radioApi } from "@/lib/api";
import { SPOTLIGHT_STATIONS } from "@/lib/curatedStations";
import { Play, Pause, Heart, Radio, Sparkles } from "lucide-react";

interface DiscoverViewProps {
  currentStation: Station | null;
  isPlaying: boolean;
  onPlayStation: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  isFavorite: (station: Station) => boolean;
  t: TranslationDict;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  currentStation,
  isPlaying,
  onPlayStation,
  onToggleFavorite,
  isFavorite,
  t,
}) => {
  const [brStations, setBrStations] = useState<Station[]>([]);
  const [elecStations, setElecStations] = useState<Station[]>([]);
  const [ambientStations, setAmbientStations] = useState<Station[]>([]);
  const [jazzStations, setJazzStations] = useState<Station[]>([]);
  const [newsStations, setNewsStations] = useState<Station[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadDiscoverSections() {
      try {
        const [br, elec, ambient, jazz, news] = await Promise.all([
          radioApi.getStationsByCountry("Brazil", 12),
          radioApi.getStationsByTag("electronic", 12),
          radioApi.getStationsByTag("ambient", 12),
          radioApi.getStationsByTag("jazz", 12),
          radioApi.getStationsByTag("news", 12),
        ]);

        if (!isMounted) return;
        if (br.length > 0) setBrStations(br);
        if (elec.length > 0) setElecStations(elec);
        if (ambient.length > 0) setAmbientStations(ambient);
        if (jazz.length > 0) setJazzStations(jazz);
        if (news.length > 0) setNewsStations(news);
      } catch {
        // preserve curated
      }
    }

    loadDiscoverSections();

    return () => {
      isMounted = false;
    };
  }, []);

  const sections = [
    {
      id: "around_the_world",
      title: t.discover.categories.aroundWorld.title,
      subtitle: t.discover.categories.aroundWorld.subtitle,
      tag: "eclectic",
      stations: SPOTLIGHT_STATIONS,
    },
    {
      id: "brazil",
      title: t.discover.categories.brazil.title,
      subtitle: t.discover.categories.brazil.subtitle,
      tag: "brazil",
      stations: brStations.length > 0 ? brStations : SPOTLIGHT_STATIONS.slice(4, 6),
    },
    {
      id: "electronic",
      title: t.discover.categories.electronic.title,
      subtitle: t.discover.categories.electronic.subtitle,
      tag: "electronic",
      stations: elecStations.length > 0 ? elecStations : SPOTLIGHT_STATIONS.slice(2, 4),
    },
    {
      id: "late_night",
      title: t.discover.categories.lateNight.title,
      subtitle: t.discover.categories.lateNight.subtitle,
      tag: "ambient",
      stations: ambientStations.length > 0 ? ambientStations : SPOTLIGHT_STATIONS.slice(3, 5),
    },
    {
      id: "jazz",
      title: t.discover.categories.jazz.title,
      subtitle: t.discover.categories.jazz.subtitle,
      tag: "jazz",
      stations: jazzStations.length > 0 ? jazzStations : SPOTLIGHT_STATIONS.slice(0, 2),
    },
    {
      id: "news",
      title: t.discover.categories.news.title,
      subtitle: t.discover.categories.news.subtitle,
      tag: "news",
      stations: newsStations.length > 0 ? newsStations : SPOTLIGHT_STATIONS.slice(1, 3),
    },
  ];

  return (
    <div className="w-full min-h-screen pt-24 pb-36 px-6 sm:px-12 max-w-7xl mx-auto space-y-12">
      {/* Editorial Header */}
      <div className="space-y-2 border-b border-white/[0.08] pb-8">
        <div className="flex items-center gap-2 text-[#e8c374] text-xs font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t.discover.badge}</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-light text-white/95 font-serif tracking-tight">
          {t.discover.title}
        </h1>
        <p className="text-sm text-white/40 max-w-2xl font-mono tracking-wide leading-relaxed">
          {t.discover.desc}
        </p>
      </div>

      {/* Category Sections with Horizontal Carousels */}
      {sections.map((category) => (
        <section key={category.id} className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-light text-white font-serif">
                {category.title}
              </h3>
              <p className="text-xs text-white/40 font-mono mt-0.5">
                {category.subtitle}
              </p>
            </div>
            <div className="text-[11px] font-mono text-white/30 hidden sm:block">
              {category.stations.length} {t.discover.frequencies}
            </div>
          </div>

          {/* Carousel */}
          <div className="flex items-stretch gap-4 overflow-x-auto pb-3 custom-scrollbar">
            {category.stations.map((st) => {
              const isCurrent =
                currentStation &&
                (currentStation.stationuuid === st.stationuuid ||
                  currentStation.name === st.name);
              const fav = isFavorite(st);

              return (
                <div
                  key={st.stationuuid || st.name}
                  className={`w-64 sm:w-72 flex-shrink-0 p-4 rounded-2xl border transition-all flex flex-col justify-between group ${
                    isCurrent
                      ? "bg-[#e8c374]/10 border-[#e8c374]/40 shadow-[0_0_25px_rgba(232,195,116,0.15)]"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/15"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Top Row: Icon + Favorite */}
                    <div className="flex items-center justify-between">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
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
                        {isCurrent && isPlaying && (
                          <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-black" />
                        )}
                      </div>

                      <button
                        onClick={() => onToggleFavorite(st)}
                        aria-label={fav ? "Remove favorite" : "Add to favorites"}
                        className={`p-2 rounded-lg transition-all ${
                          fav
                            ? "text-rose-400 bg-rose-500/10"
                            : "text-white/20 hover:text-white/70"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
                      </button>
                    </div>

                    {/* Name & Country */}
                    <div>
                      <h4 className="text-sm font-medium text-white/95 truncate group-hover:text-[#f5d382] transition-colors">
                        {st.name}
                      </h4>
                      <p className="text-xs text-white/40 truncate font-mono mt-0.5">
                        {[st.state, st.country].filter(Boolean).join(", ") || "Global"}
                      </p>
                    </div>

                    {/* Tags */}
                    <p className="text-[11px] text-white/30 truncate">
                      {st.tags || category.tag}
                    </p>
                  </div>

                  {/* Bottom Row: Bitrate + Play Button */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/[0.04]">
                    <span className="text-[10px] font-mono text-white/30 tracking-wider">
                      {st.bitrate ? `${st.bitrate} KBPS` : "LIVE"}
                    </span>

                    <button
                      onClick={() => onPlayStation(st)}
                      aria-label={isCurrent && isPlaying ? "Pause" : "Play"}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 ${
                        isCurrent && isPlaying
                          ? "bg-[#e8c374] text-black shadow-[0_0_15px_rgba(232,195,116,0.3)]"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>{t.discover.pause}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          <span>{t.discover.tuneIn}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
