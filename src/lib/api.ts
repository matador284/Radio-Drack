import { Station } from "./types";
import { FALLBACK_CITY_STATIONS, SPOTLIGHT_STATIONS } from "./curatedStations";
import { BRAZIL_POPULAR_STATIONS } from "./brazilStations";


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

    // Check if city is in Brazil
    const isBrazilCity =
      country?.toLowerCase().includes("brazil") ||
      country?.toLowerCase().includes("brasil") ||
      ["são paulo", "rio de janeiro", "belo horizonte", "salvador", "brasília", "curitiba", "porto alegre", "recife", "fortaleza", "goiânia", "manaus", "florianópolis"].includes(
        city.toLowerCase()
      );

    const localBrazilMatches = isBrazilCity
      ? BRAZIL_POPULAR_STATIONS.filter(
          (s) =>
            s.state?.toLowerCase().includes(city.toLowerCase()) ||
            s.tags?.toLowerCase().includes(city.toLowerCase()) ||
            s.name?.toLowerCase().includes(city.toLowerCase()) ||
            // Match by city name in state field OR tags (covers e.g. Goiânia stored as state=Goiás but tagged goiânia)
            s.tags?.toLowerCase().split(",").some((tag) => tag.trim() === city.toLowerCase())
        )
      : [];

    const encCity = encodeURIComponent(city);
    const endpoint = `/json/stations/search?state=${encCity}&order=votes&reverse=true&limit=${limit}&hidebroken=true`;
    let result = await fetchWithFailover<Station[]>(endpoint);

    if (!result || result.length === 0) {
      const fallbackEndpoint = `/json/stations/byname/${encCity}?order=votes&reverse=true&limit=${limit}&hidebroken=true`;
      result = await fetchWithFailover<Station[]>(fallbackEndpoint);
    }

    const apiValid = (result || []).filter((s) => s.url_resolved || s.url);

    // Merge local verified stations first
    const seen = new Set<string>();
    const combined: Station[] = [];

    for (const s of [...localBrazilMatches, ...apiValid]) {
      const key = (s.stationuuid || s.name).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(s);
      }
    }

    if (combined.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: combined });
      return combined;
    }

    if (FALLBACK_CITY_STATIONS[city]) {
      return FALLBACK_CITY_STATIONS[city];
    }

    return isBrazilCity ? BRAZIL_POPULAR_STATIONS.slice(0, 10) : SPOTLIGHT_STATIONS.slice(0, 5);
  },

  async getStationsByCountry(country: string, limit = 25): Promise<Station[]> {
    const cacheKey = `country:${country}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }

    const isBrazil =
      country.toLowerCase().includes("brazil") || country.toLowerCase().includes("brasil");

    const encCountry = encodeURIComponent(country);
    const endpoint = `/json/stations/bycountry/${encCountry}?order=votes&reverse=true&limit=${limit}&hidebroken=true`;
    const result = await fetchWithFailover<Station[]>(endpoint);
    const valid = (result || []).filter((s) => s.url_resolved || s.url);

    const seen = new Set<string>();
    const combined: Station[] = [];

    const baseList = isBrazil ? [...BRAZIL_POPULAR_STATIONS, ...valid] : valid;

    for (const s of baseList) {
      const key = (s.stationuuid || s.name).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(s);
      }
    }

    if (combined.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: combined });
      return combined;
    }

    return isBrazil ? BRAZIL_POPULAR_STATIONS : SPOTLIGHT_STATIONS;
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
    const clean = query.trim().toLowerCase();
    const cacheKey = `search:${clean}:${limit}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.time < CACHE_TTL_MS) {
      return cached.data;
    }

    // Instant match in Brazilian catalog
    const brMatches = BRAZIL_POPULAR_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(clean) ||
        s.state?.toLowerCase().includes(clean) ||
        s.tags?.toLowerCase().includes(clean) ||
        s.country.toLowerCase().includes(clean)
    );

    const enc = encodeURIComponent(clean);
    const endpoint = `/json/stations/search?name=${enc}&order=votes&reverse=true&limit=${limit}&hidebroken=true`;
    const result = await fetchWithFailover<Station[]>(endpoint);
    const valid = (result || []).filter((s) => s.url_resolved || s.url);

    const seen = new Set<string>();
    const combined: Station[] = [];

    for (const s of [...brMatches, ...valid]) {
      const key = (s.stationuuid || s.name).toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(s);
      }
    }

    if (combined.length > 0) {
      cache.set(cacheKey, { time: Date.now(), data: combined });
      return combined;
    }

    const matches = SPOTLIGHT_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(clean) ||
        s.country.toLowerCase().includes(clean) ||
        s.tags.toLowerCase().includes(clean)
    );
    return matches;
  },

};
