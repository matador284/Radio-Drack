"use client";

import React, { useState } from "react";
import { City, Station } from "@/lib/types";
import { GlobeView } from "../Globe/GlobeView";
import { GlobeOverlay } from "../Globe/GlobeOverlay";
import { CityStationsDrawer } from "../Globe/CityStationsDrawer";
import { SpotlightBar } from "../Spotlight/SpotlightBar";
import { TuningOverlay } from "../Globe/TuningOverlay";

interface ExploreViewProps {
  cities: City[];
  selectedCity: City;
  stations: Station[];
  spotlightStations: Station[];
  currentStation: Station | null;
  isPlaying: boolean;
  isLoadingStations: boolean;
  tuningMessage: string;
  isTuningVisible: boolean;
  filterMode: "LOCAL" | "WORLD";
  onSelectCity: (city: City) => void;
  onRandomCity: () => void;
  onToggleFilterMode: () => void;
  onPlayStation: (station: Station) => void;
  onToggleFavorite: (station: Station) => void;
  isFavorite: (station: Station) => boolean;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  cities,
  selectedCity,
  stations,
  spotlightStations,
  currentStation,
  isPlaying,
  isLoadingStations,
  tuningMessage,
  isTuningVisible,
  filterMode,
  onSelectCity,
  onRandomCity,
  onToggleFilterMode,
  onPlayStation,
  onToggleFavorite,
  isFavorite,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050608]">
      {/* 3D Celestial Three.js Globe */}
      <GlobeView
        cities={cities}
        selectedCity={selectedCity}
        onSelectCity={(city) => {
          onSelectCity(city);
          setIsDrawerOpen(true);
        }}
        isPlaying={isPlaying}
      />

      {/* Dynamic Flight / Tuning Status Message */}
      <TuningOverlay message={tuningMessage} isVisible={isTuningVisible} />

      {/* Floating HUD: Next Destination */}
      <GlobeOverlay
        selectedCity={selectedCity}
        onRandomCity={onRandomCity}
        filterMode={filterMode}
        onToggleFilterMode={onToggleFilterMode}
        onOpenStationList={() => setIsDrawerOpen(true)}
      />

      {/* Spotlight Bar */}
      <SpotlightBar
        stations={spotlightStations}
        currentStation={currentStation}
        isPlaying={isPlaying}
        onPlayStation={onPlayStation}
      />

      {/* City Stations Drawer */}
      <CityStationsDrawer
        city={selectedCity}
        stations={stations}
        isLoading={isLoadingStations}
        isOpen={isDrawerOpen}
        currentStation={currentStation}
        isPlaying={isPlaying}
        onClose={() => setIsDrawerOpen(false)}
        onPlayStation={onPlayStation}
        onToggleFavorite={onToggleFavorite}
        isFavorite={isFavorite}
      />
    </div>
  );
};
