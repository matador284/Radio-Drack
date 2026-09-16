"use client";

import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  isLoading: boolean;
  barCount?: number;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  isLoading,
  barCount = 24,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const spacing = 3;
      const totalSpacing = (barCount - 1) * spacing;
      const barWidth = Math.max(2, (width - totalSpacing) / barCount);

      phase += isPlaying ? 0.08 : 0.02;

      for (let i = 0; i < barCount; i++) {
        let barHeight = 3;

        if (isLoading) {
          // pulsing wave while tuning
          const wave = Math.sin(phase * 2 + i * 0.3);
          barHeight = 4 + Math.max(0, wave) * (height - 8);
        } else if (isPlaying) {
          // organic audio frequency bars
          const s1 = Math.sin(phase * 1.5 + i * 0.4);
          const s2 = Math.cos(phase * 2.3 + i * 0.7);
          const s3 = Math.sin(phase * 0.8 + i * 0.2);
          const factor = Math.abs((s1 + s2 + s3) / 3);
          // center bias like real spectrum
          const centerBias = 1 - Math.abs(i - barCount / 2) / (barCount / 2) * 0.4;
          barHeight = 4 + factor * (height - 6) * centerBias;
        }

        const x = i * (barWidth + spacing);
        const y = height - barHeight;

        // Gradient from amber gold to subtle cyan
        const gradient = ctx.createLinearGradient(0, height, 0, y);
        if (isLoading) {
          gradient.addColorStop(0, "rgba(56, 189, 248, 0.4)");
          gradient.addColorStop(1, "rgba(56, 189, 248, 0.9)");
        } else if (isPlaying) {
          gradient.addColorStop(0, "rgba(232, 195, 116, 0.4)");
          gradient.addColorStop(0.7, "rgba(245, 211, 130, 0.85)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.95)");
        } else {
          gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
          gradient.addColorStop(1, "rgba(255, 255, 255, 0.2)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // rounded bar cap
        const radius = Math.min(barWidth / 2, 2);
        ctx.roundRect(x, y, barWidth, barHeight, [radius, radius, 0, 0]);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isPlaying, isLoading, barCount]);

  return (
    <div className={`flex items-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={96}
        height={24}
        className="w-24 h-6 block"
      />
    </div>
  );
};
