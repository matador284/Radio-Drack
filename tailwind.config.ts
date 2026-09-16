import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        drack: {
          bg: "#050608",
          card: "rgba(13, 16, 23, 0.75)",
          hover: "rgba(255, 255, 255, 0.05)",
          border: "rgba(255, 255, 255, 0.08)",
          borderGlow: "rgba(232, 195, 116, 0.25)",
          amber: "#e8c374",
          gold: "#f5d382",
          cyan: "#38bdf8",
          live: "#10b981",
          signal: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 25s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
