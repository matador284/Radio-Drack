"use client";

import React, { useState, useRef, useEffect } from "react";
import { Language, TRANSLATIONS } from "@/lib/translations";
import { Globe, Check, ChevronDown } from "lucide-react";

interface LanguageSelectorProps {
  currentLang: Language;
  onSelectLang: (lang: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "pt", label: "Português (BR)", flag: "🇧🇷" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "es", label: "Español", flag: "🇪🇸" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "ja", label: "日本語", flag: "🇯🇵" },
  ];

  const current = languages.find((l) => l.code === currentLang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Select Language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/[0.06] text-xs font-mono transition-all active:scale-95"
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="hidden sm:inline uppercase text-[11px] tracking-wider">
          {current.code}
        </span>
        <ChevronDown className={`w-3 h-3 text-white/40 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#0b0e14]/98 border border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[9px] font-mono tracking-widest text-[#e8c374] uppercase border-b border-white/[0.06] mb-1">
            IDIOMA / LANGUAGE
          </div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLang(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-xs font-mono flex items-center justify-between transition-colors ${
                currentLang === lang.code
                  ? "bg-[#e8c374]/15 text-[#f5d382] font-semibold"
                  : "text-white/70 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {currentLang === lang.code && <Check className="w-3.5 h-3.5 text-[#e8c374]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
