'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import type { Region, Building } from './components/Map3D';

// Importação dinâmica para evitar SSR do mapa
const Map3D = dynamic(() => import('./components/Map3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando mapa 3D...</p>
      </div>
    </div>
  )
});

const STORAGE_KEY_REGIONS = 'citymap_regions';
const STORAGE_KEY_BUILDINGS = 'citymap_buildings';

export default function Home() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [mode, setMode] = useState<'navigate' | 'draw_region' | 'add_building'>('navigate');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    try {
      const savedRegions = localStorage.getItem(STORAGE_KEY_REGIONS);
      const savedBuildings = localStorage.getItem(STORAGE_KEY_BUILDINGS);

      if (savedRegions) {
        setRegions(JSON.parse(savedRegions));
      }
      if (savedBuildings) {
        setBuildings(JSON.parse(savedBuildings));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
    setIsLoaded(true);
  }, []);

  // Salvar regiões no localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_REGIONS, JSON.stringify(regions));
    }
  }, [regions, isLoaded]);

  // Salvar construções no localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY_BUILDINGS, JSON.stringify(buildings));
    }
  }, [buildings, isLoaded]);

  // Handlers
  const handleRegionCreated = useCallback((region: Region) => {
    setRegions(prev => [...prev, region]);
    setMode('navigate');
  }, []);

  const handleBuildingCreated = useCallback((building: Building) => {
    setBuildings(prev => [...prev, building]);
    setMode('navigate');
  }, []);

  const handleUpdateRegion = useCallback((id: string, updates: Partial<Region>) => {
    setRegions(prev => prev.map(r =>
      r.id === id ? { ...r, ...updates } : r
    ));
  }, []);

  const handleUpdateBuilding = useCallback((id: string, updates: Partial<Building>) => {
    setBuildings(prev => prev.map(b =>
      b.id === id ? { ...b, ...updates } : b
    ));
  }, []);

  const handleDeleteRegion = useCallback((id: string) => {
    setRegions(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleDeleteBuilding = useCallback((id: string) => {
    setBuildings(prev => prev.filter(b => b.id !== id));
  }, []);

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-gray-950">
      {/* Área do Mapa */}
      <div className="flex-1 relative">
        <Map3D
          regions={regions}
          buildings={buildings}
          mode={mode}
          onRegionCreated={handleRegionCreated}
          onBuildingCreated={handleBuildingCreated}
          selectedRegion={selectedRegion}
          selectedBuilding={selectedBuilding}
          onSelectRegion={setSelectedRegion}
          onSelectBuilding={setSelectedBuilding}
        />
        <Toolbar mode={mode} onModeChange={setMode} />
      </div>

      {/* Sidebar */}
      <Sidebar
        regions={regions}
        buildings={buildings}
        selectedRegion={selectedRegion}
        selectedBuilding={selectedBuilding}
        onSelectRegion={setSelectedRegion}
        onSelectBuilding={setSelectedBuilding}
        onUpdateRegion={handleUpdateRegion}
        onUpdateBuilding={handleUpdateBuilding}
        onDeleteRegion={handleDeleteRegion}
        onDeleteBuilding={handleDeleteBuilding}
      />
    </main>
  );
}
