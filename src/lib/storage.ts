import { Station } from "./types";

const FAVORITES_KEY = "radio_drack_favorites";
const HISTORY_KEY = "radio_drack_history";
const VISITED_CITIES_KEY = "radio_drack_visited_cities";
const VOLUME_KEY = "radio_drack_volume";
const INTRO_SHOWN_KEY = "radio_drack_intro_shown";
const LANGUAGE_KEY = "radio_drack_language";


export const storage = {
  getFavorites(): Station[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveFavorite(station: Station): Station[] {
    const list = this.getFavorites();
    const exists = list.some((s) => s.stationuuid === station.stationuuid || s.name === station.name);
    let updated: Station[];
    if (exists) {
      updated = list.filter((s) => s.stationuuid !== station.stationuuid && s.name !== station.name);
    } else {
      updated = [station, ...list];
    }
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch {
      // storage full or disabled
    }
    return updated;
  },

  isFavorite(station: Station | null): boolean {
    if (!station) return false;
    const list = this.getFavorites();
    return list.some((s) => s.stationuuid === station.stationuuid || s.name === station.name);
  },

  getHistory(): Station[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addToHistory(station: Station): Station[] {
    const list = this.getHistory();
    const filtered = list.filter((s) => s.stationuuid !== station.stationuuid && s.name !== station.name);
    const updated = [station, ...filtered].slice(0, 30);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // storage full
    }
    return updated;
  },

  getVisitedCities(): string[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(VISITED_CITIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordVisitedCity(cityName: string): string[] {
    const list = this.getVisitedCities();
    if (!list.includes(cityName)) {
      const updated = [cityName, ...list].slice(0, 50);
      try {
        localStorage.setItem(VISITED_CITIES_KEY, JSON.stringify(updated));
      } catch {
        // storage
      }
      return updated;
    }
    return list;
  },

  getVolume(): number {
    if (typeof window === "undefined") return 0.8;
    try {
      const val = localStorage.getItem(VOLUME_KEY);
      return val ? Math.min(1, Math.max(0, parseFloat(val))) : 0.8;
    } catch {
      return 0.8;
    }
  },

  saveVolume(volume: number) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(VOLUME_KEY, volume.toString());
    } catch {
      // ignore
    }
  },

  isIntroShown(): boolean {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(INTRO_SHOWN_KEY) === "true";
    } catch {
      return false;
    }
  },

  markIntroShown() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(INTRO_SHOWN_KEY, "true");
    } catch {
      // ignore
    }
  },

  getLanguage(): "pt" | "en" | "es" | "fr" | "ja" {
    if (typeof window === "undefined") return "pt";
    try {
      const stored = localStorage.getItem(LANGUAGE_KEY);
      if (stored === "pt" || stored === "en" || stored === "es" || stored === "fr" || stored === "ja") {
        return stored;
      }
      return "pt";
    } catch {
      return "pt";
    }
  },

  saveLanguage(lang: "pt" | "en" | "es" | "fr" | "ja") {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LANGUAGE_KEY, lang);
    } catch {
      // ignore
    }
  },
};

