"use client";

import React from "react";
import { Radio, Loader2 } from "lucide-react";

interface TuningOverlayProps {
  message: string;
  isVisible: boolean;
}

export const TuningOverlay: React.FC<TuningOverlayProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-300">
      <div className="px-5 py-2.5 rounded-full bg-[#07080c]/90 border border-[#e8c374]/30 backdrop-blur-xl shadow-[0_0_30px_rgba(232,195,116,0.25)] flex items-center gap-3">
        <Loader2 className="w-3.5 h-3.5 text-[#e8c374] animate-spin" />
        <span className="text-xs font-mono tracking-widest text-[#f5d382] uppercase">
          {message}
        </span>
        <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
      </div>
    </div>
  );
};
