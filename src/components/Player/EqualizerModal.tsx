"use client";

import React from "react";
import { EqualizerPreset } from "@/lib/audioEffects";
import { Sliders, X, Sparkles, Radio, Mic, Music } from "lucide-react";

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPreset: EqualizerPreset;
  onSelectPreset: (preset: EqualizerPreset) => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  currentPreset,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  const presets: { id: EqualizerPreset; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: "normal",
      name: "Normal / Hi-Fi",
      desc: "Resposta de frequência linear e pura do stream de transmissão.",
      icon: <Music className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "bass_boost",
      name: "Super Bass",
      desc: "Graves encorpados e reforço de baixas frequências (+8dB).",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    },
    {
      id: "vintage_radio",
      name: "Rádio Vintage AM (Retrô 1970)",
      desc: "Filtro passa-faixa nostálgico que emula rádios de pilha e valvulados.",
      icon: <Radio className="w-4 h-4 text-[#e8c374]" />,
    },
    {
      id: "voice_clarity",
      name: "Voz & Notícias",
      desc: "Realce vocal para rádios de notícias, debates e esportes.",
      icon: <Mic className="w-4 h-4 text-sky-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-[#080a0f]/95 border border-white/10 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#e8c374]">
            <Sliders className="w-5 h-5" />
            <h3 className="text-base font-semibold text-white tracking-wide">Equalizador & Efeitos de Áudio</h3>
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
          Processamento de som em tempo real via Web Audio API. Escolha o timbre ideal para a sua audição.
        </p>

        <div className="space-y-2.5">
          {presets.map((p) => {
            const isSelected = currentPreset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPreset(p.id)}
                className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? "bg-[#e8c374]/15 border-[#e8c374]/40 shadow-[0_0_20px_rgba(232,195,116,0.15)] ring-1 ring-[#e8c374]"
                    : "bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20"
                }`}
              >
                <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 flex-shrink-0">
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-white/95">{p.name}</h4>
                    {isSelected && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#e8c374] font-bold">
                        ATIVO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/45 mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
