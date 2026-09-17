"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Station, City, AppView } from "@/lib/types";
import { WORLD_CITIES } from "@/lib/cities";
import { SPOTLIGHT_STATIONS } from "@/lib/curatedStations";
import { radioApi } from "@/lib/api";
import { storage } from "@/lib/storage";
import { Language, TRANSLATIONS } from "@/lib/translations";

import { Navigation } from "@/components/Navigation";
import { ExploreView } from "@/components/Views/ExploreView";
import { DiscoverView } from "@/components/Views/DiscoverView";
import { LibraryView } from "@/components/Views/LibraryView";
import { RadioPlayer } from "@/components/Player/RadioPlayer";
import { CommandPalette } from "@/components/Search/CommandPalette";
import { IntroSplash } from "@/components/Intro/IntroSplash";
import { SleepTimerModal } from "@/components/Player/SleepTimerModal";
import { EqualizerModal } from "@/components/Player/EqualizerModal";
import { audioEffects, EqualizerPreset } from "@/lib/audioEffects";
import Hls from "hls.js";

export default function Home() {
  // Navigation, View & Language (Default: pt - Português Brasil)
  const [currentView, setCurrentView] = useState<AppView>("explore");
  const [currentLang, setCurrentLang] = useState<Language>("pt");
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.pt;

  // Cities & Stations (São Paulo default when in PT)
  const [cities] = useState<City[]>(WORLD_CITIES);
  const [selectedCity, setSelectedCity] = useState<City>(WORLD_CITIES[2]); // São Paulo default
  const [cityStations, setCityStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [spotlightStations] = useState<Station[]>(SPOTLIGHT_STATIONS);

  // Audio & Player state
  const [currentStation, setCurrentStation] = useState<Station | null>(SPOTLIGHT_STATIONS[5]); // Alpha FM SP default
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
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState<number | null>(null);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [equalizerPreset, setEqualizerPreset] = useState<EqualizerPreset>("normal");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Timers Refs
  const sleepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tuning Transition
  const [tuningMessage, setTuningMessage] = useState("");
  const [isTuningVisible, setIsTuningVisible] = useState(false);
  const [filterMode, setFilterMode] = useState<"LOCAL" | "WORLD">("LOCAL");

  // Audio HTML Element Ref & HLS Engine
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const volumeRef = useRef<number>(volume);
  volumeRef.current = volume;
  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;

  const currentStationRef = useRef<Station | null>(currentStation);
  currentStationRef.current = currentStation;
  const cityStationsRef = useRef<Station[]>(cityStations);
  cityStationsRef.current = cityStations;
  const spotlightStationsRef = useRef<Station[]>(spotlightStations);
  spotlightStationsRef.current = spotlightStations;
  const playStationRef = useRef<((st: Station) => void) | null>(null);

  // 1. Initial Storage Load (Language, History, Favorites)
  useEffect(() => {
    setFavorites(storage.getFavorites());
    setHistory(storage.getHistory());
    setVisitedCities(storage.getVisitedCities());
    const storedVol = storage.getVolume();
    setVolume(storedVol);

    const storedLang = storage.getLanguage();
    setCurrentLang(storedLang);

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

    const handleStreamFailover = () => {
      const pool =
        cityStationsRef.current.length > 0
          ? cityStationsRef.current
          : spotlightStationsRef.current;
      if (!pool || pool.length <= 1) {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setAudioStatus("SIGNAL_LOST");
        return;
      }
      const cur = currentStationRef.current;
      const currentIndex = pool.findIndex(
        (s) => s.stationuuid === cur?.stationuuid || s.name === cur?.name
      );
      const nextIndex = (currentIndex + 1) % pool.length;
      const nextStation = pool[nextIndex];

      setTuningMessage(`Sinal instável. Sintonizando: ${nextStation.name}`);
      setIsTuningVisible(true);
      setTimeout(() => setIsTuningVisible(false), 3000);

      playStationRef.current?.(nextStation);
    };

    const onError = () => {
      const a = audioRef.current;
      if (a && a.src && a.src.startsWith("http://")) {
        // Try HTTPS auto-upgrade
        const secureSrc = a.src.replace("http://", "https://");
        a.src = secureSrc;
        a.load();
        a.play().catch(() => handleStreamFailover());
        return;
      }
      handleStreamFailover();
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("error", onError);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };
  }, []);

  // Language change handler
  const handleSelectLang = (lang: Language) => {
    setCurrentLang(lang);
    storage.saveLanguage(lang);
  };



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
  const playStation = useCallback((station: Station) => {
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
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      audio.pause();
      audio.muted = isMutedRef.current;
      audio.volume = isMutedRef.current ? 0 : (volumeRef.current || 0.8);

      const isHls = streamUrl.includes(".m3u8") || station.hls === 1;

      if (
        isHls &&
        typeof window !== "undefined" &&
        !audio.canPlayType("application/vnd.apple.mpegurl") &&
        Hls.isSupported()
      ) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
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
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            hls.destroy();
            hlsRef.current = null;
            setIsPlaying(false);
            setIsLoadingAudio(false);
            setAudioStatus("SIGNAL_LOST");
          }
        });
      } else {
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
      }
    } catch {
      setIsPlaying(false);
      setIsLoadingAudio(false);
      setAudioStatus("SIGNAL_LOST");
    }
  }, []);

  useEffect(() => {
    playStationRef.current = playStation;
  }, [playStation]);

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
        audio.muted = isMutedRef.current;
        audio.volume = isMutedRef.current ? 0 : (volumeRef.current || 0.8);
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
            playStation(currentStation);
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

    const messages = t.globe.tuningMessages;
    setTuningMessage(messages[Math.floor(Math.random() * messages.length)]);
    setIsTuningVisible(true);

    setSelectedCity(randomCity);
    setCurrentView("explore");

    setTimeout(() => {
      setIsTuningVisible(false);
    }, 2200);
  }, [selectedCity.name, t.globe.tuningMessages]);

  const triggerTakeMeSomewhere = useCallback(async () => {
    const available = WORLD_CITIES.filter((c) => c.name !== selectedCity.name);
    const randomCity = available[Math.floor(Math.random() * available.length)];

    setTuningMessage(t.globe.randomTripMessage(randomCity.name));
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
  }, [selectedCity.name, playStation, t.globe]);

  const handleSelectCityByName = (cityName: string) => {
    const found = WORLD_CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
    if (found) {
      setSelectedCity(found);
      setCurrentView("explore");
    }
  };

  // 11. Sleep Timer Handler
  const handleSetSleepTimer = (minutes: number | null) => {
    setSleepTimerMinutes(minutes);
    if (sleepIntervalRef.current) {
      clearInterval(sleepIntervalRef.current);
      sleepIntervalRef.current = null;
    }
    if (!minutes) {
      setSleepTimerSecondsLeft(null);
      return;
    }
    let remaining = minutes * 60;
    setSleepTimerSecondsLeft(remaining);

    sleepIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setSleepTimerSecondsLeft(remaining);

      // Smooth fade out in the last 5 seconds
      if (remaining <= 5 && remaining > 0 && audioRef.current) {
        audioRef.current.volume = Math.max(0, (volume * remaining) / 5);
      }

      if (remaining <= 0) {
        if (sleepIntervalRef.current) clearInterval(sleepIntervalRef.current);
        sleepIntervalRef.current = null;
        setSleepTimerMinutes(null);
        setSleepTimerSecondsLeft(null);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.volume = volume;
        }
        setIsPlaying(false);
        setAudioStatus("IDLE");
      }
    }, 1000);
  };

  // 12. Live Radio Recording Handler
  const handleToggleRecord = () => {
    if (isRecording) {
      audioEffects.stopRecording(currentStation?.name || "Radio_Drack");
      setIsRecording(false);
      if (recordIntervalRef.current) {
        clearInterval(recordIntervalRef.current);
        recordIntervalRef.current = null;
      }
      setRecordSeconds(0);
    } else {
      if (!audioRef.current || !isPlaying) return;
      audioEffects.init(audioRef.current);
      const started = audioEffects.startRecording();
      if (started) {
        setIsRecording(true);
        setRecordSeconds(0);
        recordIntervalRef.current = setInterval(() => {
          setRecordSeconds((prev) => prev + 1);
        }, 1000);
      }
    }
  };

  // 13. Equalizer Preset Handler
  const handleSelectPreset = (preset: EqualizerPreset) => {
    setEqualizerPreset(preset);
    if (audioRef.current) {
      audioEffects.init(audioRef.current);
      audioEffects.setPreset(preset);
    }
  };

  // 14. TV Remote & Global Keyboard Navigation (Smart TVs, Mobile Keyboards, Desktop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in search input
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        if (e.key === "Escape") {
          setIsSearchOpen(false);
          target.blur();
        }
        return;
      }

      // Search: Ctrl+K / Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      // Play / Pause: Space
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        togglePlay();
        return;
      }

      // Next Station: ArrowRight or N
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleNextStation();
        return;
      }

      // Previous Station: ArrowLeft or P
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "p") {
        e.preventDefault();
        handlePreviousStation();
        return;
      }

      // Volume Up: ArrowUp (+5%)
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.05));
        return;
      }

      // Volume Down: ArrowDown (-5%)
      if (e.key === "ArrowDown") {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.05));
        return;
      }

      // Mute / Unmute: M
      if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        handleToggleMute();
        return;
      }

      // Fullscreen / TV Mode: F
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
        return;
      }

      // View Switching: 1 (Explorar), 2 (Descobrir), 3 (Biblioteca)
      if (e.key === "1") {
        setCurrentView("explore");
      } else if (e.key === "2") {
        setCurrentView("discover");
      } else if (e.key === "3") {
        setCurrentView("library");
      }

      // Close Search: Escape
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, handleNextStation, handlePreviousStation, volume, isMuted]);

  return (
    <main className="relative min-h-screen bg-[#050608] text-white overflow-hidden">
      {/* Cinematic Intro Splash (shown on first visit, dismissible) */}
      {isIntroVisible && (
        <IntroSplash
          t={t}
          onStart={() => {
            storage.markIntroShown();
            setIsIntroVisible(false);
          }}
        />
      )}

      {/* Minimal Top Navigation with Language Switcher */}
      <Navigation
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenSearch={() => setIsSearchOpen(true)}
        onRandomTrip={triggerTakeMeSomewhere}
        t={t}
        currentLang={currentLang}
        onSelectLang={handleSelectLang}
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
          t={t}
        />
      )}

      {currentView === "discover" && (
        <DiscoverView
          currentStation={currentStation}
          isPlaying={isPlaying}
          onPlayStation={playStation}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={checkIsFavorite}
          t={t}
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
          t={t}
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
        t={t}
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
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        sleepTimerMinutes={sleepTimerMinutes}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        currentPreset={equalizerPreset}
        onToggleRecord={handleToggleRecord}
        isRecording={isRecording}
        recordSeconds={recordSeconds}
        t={t}
      />

      {/* Sleep Timer & Audio Equalizer Modals */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        timerMinutes={sleepTimerMinutes}
        remainingSeconds={sleepTimerSecondsLeft}
        onSetTimer={handleSetSleepTimer}
      />

      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        currentPreset={equalizerPreset}
        onSelectPreset={handleSelectPreset}
      />
    </main>
  );
}
