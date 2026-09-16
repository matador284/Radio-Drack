export interface Station {
  changeuuid: string;
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  homepage: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  state: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
  hls: number;
  lastcheckok: number;
  geo_lat?: number | null;
  geo_long?: number | null;
}

export interface City {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  stationCount?: number;
  tagline?: string;
  primaryTag?: string;
}

export type AppView = "explore" | "discover" | "library";

export interface PlayerState {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  volume: number;
  isMuted: boolean;
  status: "IDLE" | "TUNING" | "TUNED_IN" | "SIGNAL_LOST";
}

export interface SearchResult {
  stations: Station[];
  cities: City[];
}
