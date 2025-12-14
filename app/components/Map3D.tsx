'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Tipos
export interface Region {
    id: string;
    name: string;
    coordinates: [number, number][];
    color: string;
}

export interface Building {
    id: string;
    name: string;
    position: [number, number];
    width: number;
    depth: number;
    height: number;
    status: 'planned' | 'in_progress' | 'completed';
}

interface Map3DProps {
    regions: Region[];
    buildings: Building[];
    mode: 'navigate' | 'draw_region' | 'add_building';
    onRegionCreated: (region: Region) => void;
    onBuildingCreated: (building: Building) => void;
    selectedRegion: string | null;
    selectedBuilding: string | null;
    onSelectRegion: (id: string | null) => void;
    onSelectBuilding: (id: string | null) => void;
}

mapboxgl.accessToken = 'pk.eyJ1IjoiZW5raTEyIiwiYSI6ImNtZzU4dzYzdTAwYzgybHB0YWE0Y2JtcGEifQ.Zc5-3NG1jq9MQFfYq3e7Mw';

// Coordenadas de São Miguel dos Campos - Alagoas
const INITIAL_CENTER: [number, number] = [-36.10, -9.78];
const INITIAL_ZOOM = 13;

const STATUS_COLORS: Record<Building['status'], string> = {
    planned: '#6495ED', // Azul
    in_progress: '#FFA500', // Laranja
    completed: '#22C55E' // Verde
};

function generatePolygonFromPosition(
    position: [number, number],
    width: number,
    depth: number
): [number, number][] {
    const [lng, lat] = position;
    const w = width / 111320;
    const d = depth / 110540;

    return [
        [lng - w / 2, lat - d / 2],
        [lng + w / 2, lat - d / 2],
        [lng + w / 2, lat + d / 2],
        [lng - w / 2, lat + d / 2],
        [lng - w / 2, lat - d / 2]
    ];
}

export default function Map3D({
    regions,
    buildings,
    mode,
    onRegionCreated,
    onBuildingCreated,
    selectedRegion,
    selectedBuilding,
    onSelectRegion,
    onSelectBuilding
}: Map3DProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([]);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Inicializar mapa
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/satellite-streets-v12', // Estilo Satélite
            center: INITIAL_CENTER,
            zoom: INITIAL_ZOOM,
            pitch: 0, // Resetar para visão 2D (top-down)
            bearing: 0,
            antialias: true
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        map.current.on('load', () => {
            setIsMapLoaded(true);

            // Adicionar fonte para regiões
            map.current!.addSource('regions', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Adicionar camada de preenchimento para regiões
            map.current!.addLayer({
                id: 'regions-fill',
                type: 'fill',
                source: 'regions',
                paint: {
                    'fill-color': ['get', 'color'],
                    'fill-opacity': 0.5
                }
            });

            // Adicionar camada de borda para regiões
            map.current!.addLayer({
                id: 'regions-outline',
                type: 'line',
                source: 'regions',
                paint: {
                    'line-color': '#ffffff',
                    'line-width': 3
                }
            });

            // Adicionar fonte para construções
            map.current!.addSource('buildings', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Adicionar camada 3D para construções (Mantendo apenas as do usuário em 3D)
            map.current!.addLayer({
                id: 'buildings-3d',
                type: 'fill-extrusion',
                source: 'buildings',
                paint: {
                    'fill-extrusion-color': ['get', 'color'],
                    'fill-extrusion-height': ['get', 'height'],
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 0.9
                }
            });

            // Adicionar fonte para pontos de desenho
            map.current!.addSource('drawing-points', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.current!.addLayer({
                id: 'drawing-points-layer',
                type: 'circle',
                source: 'drawing-points',
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#9333EA',
                    'circle-stroke-color': '#ffffff',
                    'circle-stroke-width': 2
                }
            });

            // Adicionar fonte para linha de desenho
            map.current!.addSource('drawing-line', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            map.current!.addLayer({
                id: 'drawing-line-layer',
                type: 'line',
                source: 'drawing-line',
                paint: {
                    'line-color': '#9333EA',
                    'line-width': 3,
                    'line-dasharray': [2, 2]
                }
            });
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Atualizar regiões no mapa
    useEffect(() => {
        if (!isMapLoaded || !map.current) return;

        const features = regions.map(region => ({
            type: 'Feature' as const,
            properties: {
                id: region.id,
                name: region.name,
                color: region.color,
                selected: region.id === selectedRegion
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [region.coordinates]
            }
        }));

        (map.current.getSource('regions') as mapboxgl.GeoJSONSource)?.setData({
            type: 'FeatureCollection',
            features
        });
    }, [regions, selectedRegion, isMapLoaded]);

    // Atualizar construções no mapa
    useEffect(() => {
        if (!isMapLoaded || !map.current) return;

        const features = buildings.map(building => ({
            type: 'Feature' as const,
            properties: {
                id: building.id,
                name: building.name,
                height: building.height,
                color: STATUS_COLORS[building.status],
                selected: building.id === selectedBuilding
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [generatePolygonFromPosition(building.position, building.width, building.depth)]
            }
        }));

        (map.current.getSource('buildings') as mapboxgl.GeoJSONSource)?.setData({
            type: 'FeatureCollection',
            features
        });
    }, [buildings, selectedBuilding, isMapLoaded]);

    // Atualizar pontos de desenho
    useEffect(() => {
        if (!isMapLoaded || !map.current) return;

        const pointFeatures = drawingPoints.map((coord, index) => ({
            type: 'Feature' as const,
            properties: { index },
            geometry: {
                type: 'Point' as const,
                coordinates: coord
            }
        }));

        (map.current.getSource('drawing-points') as mapboxgl.GeoJSONSource)?.setData({
            type: 'FeatureCollection',
            features: pointFeatures
        });

        // Linha de desenho
        if (drawingPoints.length >= 2) {
            const lineCoords = [...drawingPoints, drawingPoints[0]];
            (map.current.getSource('drawing-line') as mapboxgl.GeoJSONSource)?.setData({
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature' as const,
                    properties: {},
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: lineCoords
                    }
                }]
            });
        } else {
            (map.current.getSource('drawing-line') as mapboxgl.GeoJSONSource)?.setData({
                type: 'FeatureCollection',
                features: []
            });
        }
    }, [drawingPoints, isMapLoaded]);

    // Atualizar cursor baseado no modo
    useEffect(() => {
        if (!map.current) return;

        switch (mode) {
            case 'draw_region':
                map.current.getCanvas().style.cursor = 'crosshair';
                break;
            case 'add_building':
                map.current.getCanvas().style.cursor = 'cell';
                break;
            default:
                map.current.getCanvas().style.cursor = 'grab';
        }
    }, [mode]);

    // Handler para cliques no mapa
    useEffect(() => {
        if (!map.current) return;

        const handleClick = (e: mapboxgl.MapMouseEvent) => {
            const lngLat = e.lngLat;

            if (mode === 'draw_region') {
                setDrawingPoints(prev => [...prev, [lngLat.lng, lngLat.lat]]);
            } else if (mode === 'add_building') {
                const newBuilding: Building = {
                    id: `building_${Date.now()}`,
                    name: `Construção ${buildings.length + 1}`,
                    position: [lngLat.lng, lngLat.lat],
                    width: 30,
                    depth: 30,
                    height: 50,
                    status: 'in_progress'
                };
                onBuildingCreated(newBuilding);
            } else {
                // Modo navegação - verificar clique em elementos
                const regionFeatures = map.current!.queryRenderedFeatures(e.point, { layers: ['regions-fill'] });
                const buildingFeatures = map.current!.queryRenderedFeatures(e.point, { layers: ['buildings-3d'] });

                if (regionFeatures.length > 0) {
                    onSelectRegion(regionFeatures[0].properties?.id);
                    onSelectBuilding(null);
                } else if (buildingFeatures.length > 0) {
                    onSelectBuilding(buildingFeatures[0].properties?.id);
                    onSelectRegion(null);
                } else {
                    onSelectRegion(null);
                    onSelectBuilding(null);
                }
            }
        };

        const handleDblClick = (e: mapboxgl.MapMouseEvent) => {
            if (mode === 'draw_region' && drawingPoints.length >= 3) {
                e.preventDefault();
                const closedPolygon = [...drawingPoints, drawingPoints[0]];
                const newRegion: Region = {
                    id: `region_${Date.now()}`,
                    name: `Região ${regions.length + 1}`,
                    coordinates: closedPolygon,
                    color: '#9333EA'
                };
                onRegionCreated(newRegion);
                setDrawingPoints([]);
            }
        };

        map.current.on('click', handleClick);
        map.current.on('dblclick', handleDblClick);

        return () => {
            map.current?.off('click', handleClick);
            map.current?.off('dblclick', handleDblClick);
        };
    }, [mode, drawingPoints, buildings.length, regions.length, onBuildingCreated, onRegionCreated, onSelectRegion, onSelectBuilding]);

    return (
        <div className="relative w-full h-full">
            <div ref={mapContainer} className="w-full h-full" />

            {/* Indicador de modo */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                {mode === 'navigate' && '🧭 Modo Navegação'}
                {mode === 'draw_region' && (
                    <span>
                        ✏️ Desenhando Região
                        {drawingPoints.length > 0 && (
                            <span className="ml-2 text-purple-300">
                                ({drawingPoints.length} pontos - duplo clique para finalizar)
                            </span>
                        )}
                    </span>
                )}
                {mode === 'add_building' && '🏗️ Clique para adicionar construção'}
            </div>

            {/* Instruções */}
            <div className="absolute bottom-20 left-4 bg-black/70 backdrop-blur-sm text-white px-4 py-3 rounded-lg text-xs max-w-xs">
                <p className="font-semibold mb-1">Controles:</p>
                <ul className="space-y-0.5 text-gray-300">
                    <li>🖱️ Arrastar: mover mapa</li>
                    <li>🔄 Ctrl + Arrastar: rotacionar</li>
                    <li>📐 Shift + Arrastar: inclinar</li>
                    <li>🔍 Scroll: zoom</li>
                </ul>
            </div>
        </div>
    );
}
