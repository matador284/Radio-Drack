"use client";

import React, { useState, useEffect } from "react";
import { AppView } from "@/lib/types";
import { TranslationDict, Language } from "@/lib/translations";
import { LanguageSelector } from "./LanguageSelector";
import { Compass, Sparkles, Library, Search, Radio, Dices } from "lucide-react";

interface NavigationProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  onOpenSearch: () => void;
  onRandomTrip: () => void;
  t: TranslationDict;
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentView,
  onSelectView,
  onOpenSearch,
  onRandomTrip,
  t,
  currentLang,
  onSelectLang,
}) => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#06070a]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 sm:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Tabs */}
        <div className="flex items-center gap-4 sm:gap-8">
          <button
            onClick={() => onSelectView("explore")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#e8c374]/15 border border-[#e8c374]/30 flex items-center justify-center text-[#e8c374] group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(232,195,116,0.2)]">
              <Radio className="w-4 h-4 text-[#e8c374]" />
            </div>
            <div>
              <span className="text-sm font-semibold tracking-widest text-white uppercase block">
                RADIO DRACK
              </span>
              <span className="text-[9px] font-mono tracking-widest text-[#e8c374]/80 uppercase block">
                WORLD EXPLORER
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
            <button
              onClick={() => onSelectView("explore")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 ${
                currentView === "explore"
                  ? "bg-white/10 text-white font-medium shadow-sm"
                  : "text-white/45 hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.nav.explore}</span>
            </button>

            <button
              onClick={() => onSelectView("discover")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 ${
                currentView === "discover"
                  ? "bg-white/10 text-white font-medium shadow-sm"
                  : "text-white/45 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.nav.discover}</span>
            </button>

            <button
              onClick={() => onSelectView("library")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-1.5 ${
                currentView === "library"
                  ? "bg-white/10 text-white font-medium shadow-sm"
                  : "text-white/45 hover:text-white"
              }`}
            >
              <Library className="w-3.5 h-3.5" />
              <span>{t.nav.library}</span>
            </button>
          </nav>
        </div>

        {/* Search Trigger, Random Trip & Language Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Take me somewhere button */}
          <button
            onClick={onRandomTrip}
            title={t.nav.takeMeSomewhere}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-[#e8c374]/15 text-white/70 hover:text-[#f5d382] border border-white/[0.06] hover:border-[#e8c374]/30 text-xs font-mono tracking-wider transition-all active:scale-95 group"
          >
            <Dices className="w-3.5 h-3.5 text-[#e8c374] group-hover:rotate-180 transition-transform duration-500" />
            <span>{t.nav.takeMeSomewhere}</span>
          </button>

          {/* Search Trigger (⌘K) */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white border border-white/[0.06] transition-all text-xs font-mono"
            aria-label={t.nav.searchPlaceholder}
          >
            <Search className="w-3.5 h-3.5 text-[#e8c374]/80" />
            <span className="hidden md:inline">{t.nav.searchPlaceholder}</span>
            <kbd className="px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-[10px] text-white/40 tracking-wider uppercase">
              {isMac ? "⌘ K" : "Ctrl + K"}
            </kbd>
          </button>

          {/* Language Menu Dropdown */}
          <LanguageSelector currentLang={currentLang} onSelectLang={onSelectLang} />
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="flex sm:hidden items-center justify-around pt-2 mt-2 border-t border-white/[0.04]">
        <button
          onClick={() => onSelectView("explore")}
          className={`text-xs font-mono py-1 px-3 rounded-lg ${
            currentView === "explore" ? "text-[#e8c374] bg-white/5" : "text-white/40"
          }`}
        >
          {t.nav.explore}
        </button>
        <button
          onClick={() => onSelectView("discover")}
          className={`text-xs font-mono py-1 px-3 rounded-lg ${
            currentView === "discover" ? "text-[#e8c374] bg-white/5" : "text-white/40"
          }`}
        >
          {t.nav.discover}
        </button>
        <button
          onClick={() => onSelectView("library")}
          className={`text-xs font-mono py-1 px-3 rounded-lg ${
            currentView === "library" ? "text-[#e8c374] bg-white/5" : "text-white/40"
          }`}
        >
          {t.nav.library}
        </button>
      </div>
    </header>
  );
};
