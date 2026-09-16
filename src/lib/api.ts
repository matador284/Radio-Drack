import { Station } from "./types";
import { FALLBACK_CITY_STATIONS, SPOTLIGHT_STATIONS } from "./curatedStations";

const API_SERVERS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

let currentServerIndex = 0;

const cache = new Map<string, { time: number; data: Station[] }>();
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 min cache

async function fetchWithFailover<T>(endpoint: string, timeoutMs = 6000): Promise<T | null> {
  const attempts = API_SERVERS.length;
  for (let i = 0; i < attempts; i++) {
    const server = API_SERVERS[(currentServerIndex + i) % attempts];
    const url = `${server}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "RadioDrack/1.0 (world-radio-explorer)",
          Accept: "application/json",
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) {
        currentServerIndex = (currentServerIndex + i) % attempts;
        const data = await res.json();
        return data as T;
      }
    } catch {
      clearTimeout(timeout);
      // next server
    }
  }
  return null;
}

export const radioApi = {
  async getStationsByCity(city: string, country?: string, limit = 25): Promise<Station[]> {
    const cacheKey = `city:${city}:${country || ""}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }

    const encCity = encodeURIComponent(city);
    const endpoint = `/json/stations/search?state=${encCity}&order=votes&reverse=true&limit=${limit}&hidebroken=true`;
    let result = await fetchWithFailover<Station[]>(endpoint);

    if (!result || result.length === 0) {
      // try by tag or name
      const fallbackEndpoint = `/json/stations/byname/${encCity}?order=votes&reverse=true&limit=${limit}&hidebroken=true`;
      result = await fetchWithFailover<Station[]>(fallbackEndpoint);
    }

    // Filter stations with valid streams
    const valid = (result || []).filter((s) => s.url_resolved || s.url);

    if (valid.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: valid });
      return valid;
    }

    // Use curated fallback if available for this city
    if (FALLBACK_CITY_STATIONS[city]) {
      return FALLBACK_CITY_STATIONS[city];
    }

    return SPOTLIGHT_STATIONS.slice(0, 5);
  },

  async getStationsByCountry(country: string, limit = 25): Promise<Station[]> {
    const cacheKey = `country:${country}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }

    const encCountry = encodeURIComponent(country);
    const endpoint = `/json/stations/bycountry/${encCountry}?order=votes&reverse=true&limit=${limit}&hidebroken=true`;
    const result = await fetchWithFailover<Station[]>(endpoint);
    const valid = (result || []).filter((s) => s.url_resolved || s.url);

    if (valid.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: valid });
      return valid;
    }

    return SPOTLIGHT_STATIONS;
  },

  async getStationsByTag(tag: string, limit = 20): Promise<Station[]> {
    const cacheKey = `tag:${tag}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }

    const encTag = encodeURIComponent(tag);
    const endpoint = `/json/stations/bytag/${encTag}?order=votes&reverse=true&limit=${limit}&hidebroken=true`;
    const result = await fetchWithFailover<Station[]>(endpoint);
    const valid = (result || []).filter((s) => s.url_resolved || s.url);

    if (valid.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: valid });
      return valid;
    }

    return SPOTLIGHT_STATIONS;
  },

  async getTopStations(limit = 20): Promise<Station[]> {
    const cacheKey = `top:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }

    const endpoint = `/json/stations/topclick/${limit}?hidebroken=true`;
    const result = await fetchWithFailover<Station[]>(endpoint);
    const valid = (result || []).filter((s) => s.url_resolved || s.url);

    if (valid.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: valid });
      return valid;
    }

    return SPOTLIGHT_STATIONS;
  },

  async searchStations(query: string, limit = 30): Promise<Station[]> {
    if (!query || query.trim().length === 0) return [];
    const clean = query.trim();
    const cacheKey = `search:${clean}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }

    const enc = encodeURIComponent(clean);
    const endpoint = `/json/stations/search?name=${enc}&order=votes&reverse=true&limit=${limit}&hidebroken=true`;
    const result = await fetchWithFailover<Station[]>(endpoint);
    const valid = (result || []).filter((s) => s.url_resolved || s.url);

    if (valid.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: valid });
      return valid;
    }

    // fallback matching curated list
    const qLower = clean.toLowerCase();
    const matches = SPOTLIGHT_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(qLower) ||
        s.country.toLowerCase().includes(qLower) ||
        s.tags.toLowerCase().includes(qLower)
    );
    return matches;
  },
};
