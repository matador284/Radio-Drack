"use client";

import React from "react";
import { Moon, X, Clock, Check } from "lucide-react";

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerMinutes: number | null;
  remainingSeconds: number | null;
  onSetTimer: (minutes: number | null) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  timerMinutes,
  remainingSeconds,
  onSetTimer,
}) => {
  if (!isOpen) return null;

  const presets = [
    { min: 15, label: "15 minutos" },
    { min: 30, label: "30 minutos" },
    { min: 45, label: "45 minutos" },
    { min: 60, label: "1 hora" },
    { min: 90, label: "1h 30m" },
  ];

  const formatRemaining = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-[#080a0f]/95 border border-white/10 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#e8c374]">
            <Moon className="w-5 h-5" />
            <h3 className="text-base font-semibold text-white tracking-wide">Modo Sono (Sleep Timer)</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-white/50 leading-relaxed">
          O áudio diminuirá gradualmente de volume até pausar automaticamente quando o tempo terminar.
        </p>

        {remainingSeconds !== null && remainingSeconds > 0 && (
          <div className="p-3.5 rounded-xl bg-[#e8c374]/10 border border-[#e8c374]/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#f5d382]">
              <Clock className="w-4 h-4 animate-pulse" />
              <span className="text-xs font-mono font-medium">Desligamento em:</span>
            </div>
            <span className="text-lg font-mono font-bold text-[#e8c374]">
              {formatRemaining(remainingSeconds)}
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {presets.map((p) => {
            const isSelected = timerMinutes === p.min;
            return (
              <button
                key={p.min}
                onClick={() => {
                  onSetTimer(p.min);
                  onClose();
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-mono border transition-all flex items-center justify-between ${
                  isSelected
                    ? "bg-[#e8c374] text-black font-bold border-[#e8c374] shadow-[0_0_15px_rgba(232,195,116,0.3)]"
                    : "bg-white/[0.03] border-white/[0.08] text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span>{p.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
              </button>
            );
          })}
        </div>

        {timerMinutes !== null && (
          <button
            onClick={() => {
              onSetTimer(null);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            Desativar Temporizador
          </button>
        )}
      </div>
    </div>
  );
};
