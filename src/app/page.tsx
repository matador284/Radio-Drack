"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Station, City, AppView } from "@/lib/types";
import { WORLD_CITIES } from "@/lib/cities";
import { SPOTLIGHT_STATIONS } from "@/lib/curatedStations";
import { radioApi } from "@/lib/api";
import { storage } from "@/lib/storage";

import { Navigation } from "@/components/Navigation";
import { ExploreView } from "@/components/Views/ExploreView";
import { DiscoverView } from "@/components/Views/DiscoverView";
import { LibraryView } from "@/components/Views/LibraryView";
import { RadioPlayer } from "@/components/Player/RadioPlayer";
import { CommandPalette } from "@/components/Search/CommandPalette";
import { IntroSplash } from "@/components/Intro/IntroSplash";

export default function Home() {
  // Navigation & View
  const [currentView, setCurrentView] = useState<AppView>("explore");

  // Cities & Stations
  const [cities] = useState<City[]>(WORLD_CITIES);
  const [selectedCity, setSelectedCity] = useState<City>(WORLD_CITIES[0]); // Paris initially
  const [cityStations, setCityStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [spotlightStations] = useState<Station[]>(SPOTLIGHT_STATIONS);

  // Audio & Player state
  const [currentStation, setCurrentStation] = useState<Station | null>(SPOTLIGHT_STATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioStatus, setAudioStatus] = useState<"IDLE" | "TUNING" | "TUNED_IN" | "SIGNAL_LOST">("IDLE");
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // User Library & History
  const [favorites, setFavorites] = useState<Station[]>([]);
  const [history, setHistory] = useState<Station[]>([]);
  const [visitedCities, setVisitedCities] = useState<string[]>([]);

  // Search & Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isIntroVisible, setIsIntroVisible] = useState(false);

  // Tuning Transition
  const [tuningMessage, setTuningMessage] = useState("");
  const [isTuningVisible, setIsTuningVisible] = useState(false);
  const [filterMode, setFilterMode] = useState<"LOCAL" | "WORLD">("LOCAL");

  // Audio HTML Element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Storage Load
  useEffect(() => {
    setFavorites(storage.getFavorites());
    setHistory(storage.getHistory());
    setVisitedCities(storage.getVisitedCities());
    const storedVol = storage.getVolume();
    setVolume(storedVol);

    if (!storage.isIntroShown()) {
      setIsIntroVisible(true);
    }

    // Audio instance setup
    const audio = new Audio();
    audio.preload = "none";
    audio.volume = storedVol;
    audioRef.current = audio;

    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoadingAudio(false);
      setAudioStatus("TUNED_IN");
    };

    const onWaiting = () => {
      setIsLoadingAudio(true);
      setAudioStatus("TUNING");
    };

    const onError = () => {
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setAudioStatus("SIGNAL_LOST");
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);
    audio.addEventListener("stalled", onError);

    return () => {
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("stalled", onError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // 2. Global Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 3. Fetch stations when selectedCity changes
  const loadStationsForCity = useCallback(async (city: City) => {
    setIsLoadingStations(true);
    try {
      const results = await radioApi.getStationsByCity(city.name, city.country, 25);
      setCityStations(results);
    } catch {
      setCityStations([]);
    } finally {
      setIsLoadingStations(false);
    }
  }, []);

  useEffect(() => {
    loadStationsForCity(selectedCity);
    const updated = storage.recordVisitedCity(selectedCity.name);
    setVisitedCities(updated);
  }, [selectedCity, loadStationsForCity]);

  // 4. Play station stream
  const playStation = useCallback(
    (station: Station) => {
      const audio = audioRef.current;
      if (!audio) return;

      const streamUrl = station.url_resolved || station.url;
      if (!streamUrl) {
        setAudioStatus("SIGNAL_LOST");
        return;
      }

      setCurrentStation(station);
      setIsLoadingAudio(true);
      setAudioStatus("TUNING");

      // Record to history
      const updatedHistory = storage.addToHistory(station);
      setHistory(updatedHistory);

      try {
        audio.pause();
        audio.src = streamUrl;
        audio.load();

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setIsLoadingAudio(false);
              setAudioStatus("TUNED_IN");
            })
            .catch(() => {
              setIsPlaying(false);
              setIsLoadingAudio(false);
              setAudioStatus("SIGNAL_LOST");
            });
        }
      } catch {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setAudioStatus("SIGNAL_LOST");
      }
    },
    []
  );

  // 5. Play / Pause toggle
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentStation) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setAudioStatus("IDLE");
    } else {
      if (!audio.src && (currentStation.url_resolved || currentStation.url)) {
        playStation(currentStation);
      } else {
        setIsLoadingAudio(true);
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
            setAudioStatus("TUNED_IN");
          })
          .catch(() => {
            setIsPlaying(false);
            setIsLoadingAudio(false);
            setAudioStatus("SIGNAL_LOST");
          });
      }
    }
  };

  // 6. Next & Previous station in current city or spotlight
  const handleNextStation = () => {
    const pool = cityStations.length > 0 ? cityStations : spotlightStations;
    if (!pool.length) return;
    const currentIndex = pool.findIndex(
      (s) => s.stationuuid === currentStation?.stationuuid || s.name === currentStation?.name
    );
    const nextIndex = (currentIndex + 1) % pool.length;
    playStation(pool[nextIndex]);
  };

  const handlePreviousStation = () => {
    const pool = cityStations.length > 0 ? cityStations : spotlightStations;
    if (!pool.length) return;
    const currentIndex = pool.findIndex(
      (s) => s.stationuuid === currentStation?.stationuuid || s.name === currentStation?.name
    );
    const prevIndex = (currentIndex - 1 + pool.length) % pool.length;
    playStation(pool[prevIndex]);
  };

  // 7. Volume controls
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    storage.saveVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      if (newVol > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // 8. Favorite toggle
  const handleToggleFavorite = (station: Station) => {
    const updated = storage.saveFavorite(station);
    setFavorites(updated);
  };

  const checkIsFavorite = (station: Station | null) => {
    if (!station) return false;
    return favorites.some(
      (s) => s.stationuuid === station.stationuuid || s.name === station.name
    );
  };

  // 9. Random City ("Somewhere new") & Random Radio ("Take me somewhere")
  const triggerRandomCity = useCallback(() => {
    const available = WORLD_CITIES.filter((c) => c.name !== selectedCity.name);
    const randomCity = available[Math.floor(Math.random() * available.length)];

    const messages = [
      `Searching the airwaves…`,
      `Crossing the hemisphere…`,
      `Aligning coordinates to ${randomCity.name}…`,
      `Tuning into ${randomCity.name}…`,
      `Catching the frequency…`,
    ];
    setTuningMessage(messages[Math.floor(Math.random() * messages.length)]);
    setIsTuningVisible(true);

    setSelectedCity(randomCity);
    setCurrentView("explore");

    // Hide transition banner after 2.2s
    setTimeout(() => {
      setIsTuningVisible(false);
    }, 2200);
  }, [selectedCity.name]);

  const triggerTakeMeSomewhere = useCallback(async () => {
    const available = WORLD_CITIES.filter((c) => c.name !== selectedCity.name);
    const randomCity = available[Math.floor(Math.random() * available.length)];

    setTuningMessage(`Crossing the Atlantic… Tuning into ${randomCity.name}`);
    setIsTuningVisible(true);

    setSelectedCity(randomCity);
    setCurrentView("explore");

    try {
      const results = await radioApi.getStationsByCity(randomCity.name, randomCity.country, 10);
      if (results.length > 0) {
        const randomStation = results[Math.floor(Math.random() * results.length)];
        playStation(randomStation);
      }
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsTuningVisible(false);
    }, 2500);
  }, [selectedCity.name, playStation]);

  const handleSelectCityByName = (cityName: string) => {
    const found = WORLD_CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (found) {
      setSelectedCity(found);
      setCurrentView("explore");
    }
  };

  return (
    <main className="relative min-h-screen bg-[#050608] text-white overflow-hidden">
      {/* Cinematic Intro Splash (shown on first visit, dismissible) */}
      {isIntroVisible && (
        <IntroSplash
          onStart={() => {
            storage.markIntroShown();
            setIsIntroVisible(false);
          }}
        />
      )}

      {/* Minimal Top Navigation */}
      <Navigation
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRandomTrip={triggerTakeMeSomewhere}
      />

      {/* Main Views */}
      {currentView === "explore" && (
        <ExploreView
          cities={cities}
          selectedCity={selectedCity}
          stations={cityStations}
          spotlightStations={spotlightStations}
          currentStation={currentStation}
          isPlaying={isPlaying}
          isLoadingStations={isLoadingStations}
          tuningMessage={tuningMessage}
          isTuningVisible={isTuningVisible}
          filterMode={filterMode}
          onSelectCity={setSelectedCity}
          onRandomCity={triggerRandomCity}
          onToggleFilterMode={() =>
            setFilterMode((prev) => (prev === "LOCAL" ? "WORLD" : "LOCAL"))
          }
          onPlayStation={playStation}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={checkIsFavorite}
        />
      )}

      {currentView === "discover" && (
        <DiscoverView
          currentStation={currentStation}
          isPlaying={isPlaying}
          onPlayStation={playStation}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={checkIsFavorite}
        />
      )}

      {currentView === "library" && (
        <LibraryView
          favorites={favorites}
          history={history}
          visitedCities={visitedCities}
          currentStation={currentStation}
          isPlaying={isPlaying}
          onPlayStation={playStation}
          onToggleFavorite={handleToggleFavorite}
          onSelectCityByName={handleSelectCityByName}
        />
      )}

      {/* Global Command Palette (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onPlayStation={playStation}
        onSelectCity={(city) => {
          setSelectedCity(city);
          setCurrentView("explore");
        }}
      />

      {/* Persistent Bottom Radio Player */}
      <RadioPlayer
        station={currentStation}
        isPlaying={isPlaying}
        isLoading={isLoadingAudio}
        status={audioStatus}
        volume={volume}
        isMuted={isMuted}
        isFavorite={checkIsFavorite(currentStation)}
        onTogglePlay={togglePlay}
        onPrevious={handlePreviousStation}
        onNext={handleNextStation}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleFavorite={() => currentStation && handleToggleFavorite(currentStation)}
        onRetry={() => currentStation && playStation(currentStation)}
      />
    </main>
  );
}
