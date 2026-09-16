"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Globe, Compass, ArrowRight } from "lucide-react";

interface IntroSplashProps {
  onStart: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onStart }) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(2), 1600);
    return () => clearTimeout(t1);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#050608] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-700">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#e8c374]/10 via-[#38bdf8]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-xl space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono tracking-widest uppercase text-[#e8c374]">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
          <span>RADIO DRACK · WORLD ATLAS</span>
        </div>

        {step === 1 && (
          <h1 className="text-4xl sm:text-6xl font-light text-white font-serif tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            A world of sound.
          </h1>
        )}

        {step >= 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-6xl font-light text-white font-serif tracking-tight">
              Thousands of stations.
              <br />
              <span className="text-[#f5d382]">One planet.</span>
            </h1>
            <p className="text-sm text-white/40 font-mono tracking-wide max-w-md mx-auto">
              Real-time atmospheric radio waves streamed directly from cities across every continent.
            </p>
          </div>
        )}

        <div className="pt-4 flex items-center justify-center gap-4">
          <button
            onClick={onStart}
            className="px-6 py-3 rounded-xl bg-[#e8c374] hover:bg-[#f5d382] text-black text-xs font-mono font-semibold tracking-widest uppercase shadow-[0_0_30px_rgba(232,195,116,0.4)] transition-all active:scale-95 flex items-center gap-2 group"
          >
            <span>START EXPLORING</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <button
          onClick={onStart}
          className="text-[11px] font-mono tracking-wider text-white/30 hover:text-white/60 transition-colors uppercase pt-2"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
};
