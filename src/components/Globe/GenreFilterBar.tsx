"use client";

import React from "react";
import { Sparkles, Music } from "lucide-react";

interface GenreFilterBarProps {
  selectedGenre: string | null;
  onSelectGenre: (genre: string | null) => void;
}

export const GENRE_LIST = [
  { id: "sertanejo", label: "🤠 Sertanejo" },
  { id: "rock", label: "🎸 Rock" },
  { id: "pop", label: "✨ Pop" },
  { id: "mpb", label: "🇧🇷 MPB" },
  { id: "notícias", label: "📰 Notícias" },
  { id: "electronic", label: "⚡ Eletrônica" },
  { id: "jazz", label: "🎷 Jazz" },
  { id: "gospel", label: "🕊️ Gospel" },
  { id: "80s", label: "📼 Anos 80" },
];

export const GenreFilterBar: React.FC<GenreFilterBarProps> = ({
  selectedGenre,
  onSelectGenre,
}) => {
  return (
    <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto max-w-[calc(100vw-2rem)] sm:max-w-2xl px-2">
      <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-2.5 rounded-2xl bg-[#07080c]/85 border border-white/10 backdrop-blur-xl shadow-xl no-scrollbar">
        <button
          onClick={() => onSelectGenre(null)}
          className={`px-3 py-1 rounded-xl text-xs font-mono tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedGenre === null
              ? "bg-[#e8c374] text-black font-semibold shadow-[0_0_12px_rgba(232,195,116,0.3)]"
              : "text-white/50 hover:text-white hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Todos</span>
        </button>

        {GENRE_LIST.map((g) => {
          const isSelected = selectedGenre === g.id;
          return (
            <button
              key={g.id}
              onClick={() => onSelectGenre(isSelected ? null : g.id)}
              className={`px-3 py-1 rounded-xl text-xs font-mono tracking-wider whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? "bg-[#e8c374] text-black font-semibold shadow-[0_0_12px_rgba(232,195,116,0.3)]"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>{g.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
