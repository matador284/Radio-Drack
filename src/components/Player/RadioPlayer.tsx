"use client";

import React, { useState } from "react";
import { Station } from "@/lib/types";
import { TranslationDict } from "@/lib/translations";
import { AudioVisualizer } from "./AudioVisualizer";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Share2,
  Radio,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";

interface RadioPlayerProps {
  station: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  status: "IDLE" | "TUNING" | "TUNED_IN" | "SIGNAL_LOST";
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleFavorite: () => void;
  onRetry: () => void;
  t: TranslationDict;
}

export const RadioPlayer: React.FC<RadioPlayerProps> = ({
  station,
  isPlaying,
  isLoading,
  status,
  volume,
  isMuted,
  isFavorite,
  onTogglePlay,
  onPrevious,
  onNext,
  onVolumeChange,
  onToggleMute,
  onToggleFavorite,
  onRetry,
  t,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!station) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080c]/90 backdrop-blur-xl border-t border-white/[0.06] px-6 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 text-white/40 text-xs tracking-wider uppercase font-mono">
            <Radio className="w-4 h-4 animate-pulse text-[#e8c374]/60" />
            <span>{t.player.selectToTune}</span>
          </div>
          <div className="text-xs text-white/30 font-mono tracking-widest uppercase">
            {t.player.ready}
          </div>
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}?station=${encodeURIComponent(station.stationuuid || station.name)}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // ignore
    }
  };

  const bitrateText = station.bitrate ? `${station.bitrate} KBPS` : "128 KBPS";
  const codecText = station.codec ? station.codec.toUpperCase() : "MP3";
  const locationText = [station.state || station.name, station.country].filter(Boolean).join(" · ");

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-[#07080c]/92 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-10px_40px_rgba(0,0,0,0.7)] px-4 sm:px-8 py-3.5 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
        {/* Station Info */}
        <div className="flex items-center gap-3.5 w-full md:w-1/3 min-w-0">
          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-white/[0.04] border border-white/[0.08] flex-shrink-0 flex items-center justify-center shadow-inner group">
            {station.favicon && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={station.favicon}
                alt={station.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <Radio className="w-5 h-5 text-[#e8c374]/80" />
            )}
            {isPlaying && (
              <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-white/95 truncate tracking-tight">
                {station.name}
              </h4>
              {status === "TUNED_IN" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {t.player.live}
                </span>
              )}
              {status === "TUNING" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-widest bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse">
                  {t.player.tuning}
                </span>
              )}
              {status === "SIGNAL_LOST" && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertCircle className="w-2.5 h-2.5" />
                  {t.player.signalLost}
                </span>
              )}
            </div>
            <p className="text-xs text-white/40 truncate tracking-wide mt-0.5">
              {locationText || station.tags || "World Stream"}
            </p>
          </div>
        </div>

        {/* Center Controls & Audio Visualizer */}
        <div className="flex flex-col items-center gap-2 w-full md:w-1/3">
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={onPrevious}
              aria-label={t.player.previous}
              className="text-white/50 hover:text-white/90 active:scale-95 transition-all p-1"
              title={t.player.previous}
            >
              <SkipBack className="w-4 h-4" />
            </button>

            {status === "SIGNAL_LOST" ? (
              <button
                onClick={onRetry}
                aria-label={t.player.tryAgain}
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center justify-center transition-all active:scale-95 group"
                title={t.player.tryAgain}
              >
                <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            ) : (
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 relative ${
                  isPlaying
                    ? "bg-[#e8c374] text-black shadow-[0_0_20px_rgba(232,195,116,0.4)] hover:bg-[#f5d382]"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                }`}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            )}

            <button
              onClick={onNext}
              aria-label={t.player.next}
              className="text-white/50 hover:text-white/90 active:scale-95 transition-all p-1"
              title={t.player.next}
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <AudioVisualizer isPlaying={isPlaying} isLoading={isLoading} />
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-white/30 tracking-wider">
              <span>{codecText}</span>
              <span>·</span>
              <span>{bitrateText}</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Volume, Favorite, Share */}
        <div className="flex items-center justify-end gap-3 sm:gap-4 w-full md:w-1/3">
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="text-white/40 hover:text-white/90 transition-colors p-1"
              title={isMuted ? t.player.unmute : t.player.mute}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400/80" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="Volume slider"
              className="w-16 sm:w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#e8c374] focus:outline-none"
            />
          </div>

          {/* Favorite */}
          <button
            onClick={onToggleFavorite}
            aria-label={t.player.favorite}
            className={`p-2 rounded-lg border transition-all active:scale-90 ${
              isFavorite
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                : "bg-white/[0.03] border-white/[0.06] text-white/40 hover:text-white hover:border-white/20"
            }`}
            title={t.player.favorite}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            aria-label={t.player.share}
            className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white hover:border-white/20 transition-all active:scale-90 relative"
            title={t.player.share}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            {copied && (
              <span className="absolute -top-7 right-0 text-[10px] font-mono tracking-wider bg-emerald-500 text-black font-semibold px-1.5 py-0.5 rounded shadow">
                {t.player.copied}
              </span>
            )}
          </button>
        </div>
      </div>
    </footer>
  );
};
