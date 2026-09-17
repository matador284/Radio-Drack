"use client";

import React, { useState } from "react";
import { City, Station } from "@/lib/types";
import { TranslationDict } from "@/lib/translations";
import dynamic from "next/dynamic";
import { GlobeView } from "../Globe/GlobeView";
import { GlobeOverlay } from "../Globe/GlobeOverlay";
import { CityStationsDrawer } from "../Globe/CityStationsDrawer";
import { SpotlightBar } from "../Spotlight/SpotlightBar";
import { TuningOverlay } from "../Globe/TuningOverlay";

const StreetMapView = dynamic(
  () => import("../Globe/StreetMapView").then((mod) => mod.StreetMapView),
  { ssr: false }
);


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
  t: TranslationDict;
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
  t,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGpsMode, setIsGpsMode] = useState(false);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#050608]">
      {/* View Switch: NASA 3D Earth OR GPS Street-Level Map */}
      {isGpsMode ? (
        <StreetMapView
          city={selectedCity}
          stations={stations}
          currentStation={currentStation}
          isPlaying={isPlaying}
          onPlayStation={onPlayStation}
          onReturnToGlobe={() => setIsGpsMode(false)}
          t={t}
        />
      ) : (
        <>
          {/* NASA Photorealistic 3D Globe */}
          <GlobeView
            cities={cities}
            selectedCity={selectedCity}
            onSelectCity={(city) => {
              onSelectCity(city);
              setIsDrawerOpen(true);
            }}
            onZoomIntoCity={() => {
              setIsGpsMode(true);
            }}
            isPlaying={isPlaying}
          />

          {/* Dynamic Flight / Tuning Status Message */}
          <TuningOverlay message={tuningMessage} isVisible={isTuningVisible} />

          {/* Floating HUD: Next Destination with GPS button */}
          <GlobeOverlay
            selectedCity={selectedCity}
            onRandomCity={onRandomCity}
            filterMode={filterMode}
            onToggleFilterMode={onToggleFilterMode}
            onOpenStationList={() => setIsDrawerOpen(true)}
            onOpenStreetMap={() => setIsGpsMode(true)}
            t={t}
          />

          {/* Spotlight Bar */}
          <SpotlightBar
            stations={spotlightStations}
            currentStation={currentStation}
            isPlaying={isPlaying}
            onPlayStation={onPlayStation}
            t={t}
          />
        </>
      )}

      {/* City Stations Drawer (Accessible in both Globe and Street mode) */}
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
        t={t}
      />
    </div>
  );
};
