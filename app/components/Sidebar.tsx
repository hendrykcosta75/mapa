'use client';

import type { Region, Building } from './Map3D';

interface SidebarProps {
    regions: Region[];
    buildings: Building[];
    selectedRegion: string | null;
    selectedBuilding: string | null;
    onSelectRegion: (id: string | null) => void;
    onSelectBuilding: (id: string | null) => void;
    onUpdateRegion: (id: string, updates: Partial<Region>) => void;
    onUpdateBuilding: (id: string, updates: Partial<Building>) => void;
    onDeleteRegion: (id: string) => void;
    onDeleteBuilding: (id: string) => void;
}

const STATUS_LABELS: Record<Building['status'], string> = {
    planned: 'Planejada',
    in_progress: 'Em Andamento',
    completed: 'Concluída'
};

const STATUS_COLORS: Record<Building['status'], string> = {
    planned: 'bg-blue-500',
    in_progress: 'bg-orange-500',
    completed: 'bg-green-500'
};

export default function Sidebar({
    regions,
    buildings,
    selectedRegion,
    selectedBuilding,
    onSelectRegion,
    onSelectBuilding,
    onUpdateRegion,
    onUpdateBuilding,
    onDeleteRegion,
    onDeleteBuilding
}: SidebarProps) {
    const selectedRegionData = regions.find(r => r.id === selectedRegion);
    const selectedBuildingData = buildings.find(b => b.id === selectedBuilding);

    return (
        <aside className="w-80 bg-gradient-to-b from-gray-900 to-gray-950 border-l border-gray-800 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    🗺️ Mapa 3D
                </h1>
                <p className="text-xs text-gray-500 mt-1">São Miguel dos Campos - AL</p>
            </div>

            {/* Conteúdo scrollável */}
            <div className="flex-1 overflow-y-auto">
                {/* Editor de elemento selecionado */}
                {(selectedRegionData || selectedBuildingData) && (
                    <div className="p-4 border-b border-gray-800 bg-purple-900/20">
                        <h3 className="text-sm font-semibold text-purple-300 mb-3">
                            {selectedRegionData ? '✏️ Editar Região' : '🏗️ Editar Construção'}
                        </h3>

                        {selectedRegionData && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={selectedRegionData.name}
                                        onChange={(e) => onUpdateRegion(selectedRegionData.id, { name: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        onDeleteRegion(selectedRegionData.id);
                                        onSelectRegion(null);
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
                                >
                                    🗑️ Excluir Região
                                </button>
                            </div>
                        )}

                        {selectedBuildingData && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Nome</label>
                                    <input
                                        type="text"
                                        value={selectedBuildingData.name}
                                        onChange={(e) => onUpdateBuilding(selectedBuildingData.id, { name: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Largura (m)</label>
                                        <input
                                            type="number"
                                            value={selectedBuildingData.width}
                                            onChange={(e) => onUpdateBuilding(selectedBuildingData.id, { width: Number(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Prof. (m)</label>
                                        <input
                                            type="number"
                                            value={selectedBuildingData.depth}
                                            onChange={(e) => onUpdateBuilding(selectedBuildingData.id, { depth: Number(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">Altura (m)</label>
                                        <input
                                            type="number"
                                            value={selectedBuildingData.height}
                                            onChange={(e) => onUpdateBuilding(selectedBuildingData.id, { height: Number(e.target.value) })}
                                            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">Status</label>
                                    <select
                                        value={selectedBuildingData.status}
                                        onChange={(e) => onUpdateBuilding(selectedBuildingData.id, { status: e.target.value as Building['status'] })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                                    >
                                        <option value="planned">🔵 Planejada</option>
                                        <option value="in_progress">🟠 Em Andamento</option>
                                        <option value="completed">🟢 Concluída</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => {
                                        onDeleteBuilding(selectedBuildingData.id);
                                        onSelectBuilding(null);
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors"
                                >
                                    🗑️ Excluir Construção
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Lista de Regiões */}
                <div className="p-4 border-b border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        📍 Regiões
                        <span className="bg-purple-600 text-xs px-2 py-0.5 rounded-full">
                            {regions.length}
                        </span>
                    </h3>
                    {regions.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                            Nenhuma região criada ainda
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {regions.map((region) => (
                                <li
                                    key={region.id}
                                    onClick={() => {
                                        onSelectRegion(region.id);
                                        onSelectBuilding(null);
                                    }}
                                    className={`
                    px-3 py-2 rounded cursor-pointer text-sm transition-all
                    ${selectedRegion === region.id
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                  `}
                                >
                                    <span className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: region.color }}
                                        />
                                        {region.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Lista de Construções */}
                <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        🏗️ Construções
                        <span className="bg-orange-600 text-xs px-2 py-0.5 rounded-full">
                            {buildings.length}
                        </span>
                    </h3>
                    {buildings.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                            Nenhuma construção adicionada ainda
                        </p>
                    ) : (
                        <ul className="space-y-1">
                            {buildings.map((building) => (
                                <li
                                    key={building.id}
                                    onClick={() => {
                                        onSelectBuilding(building.id);
                                        onSelectRegion(null);
                                    }}
                                    className={`
                    px-3 py-2 rounded cursor-pointer text-sm transition-all
                    ${selectedBuilding === building.id
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                  `}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{building.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[building.status]}`}>
                                            {STATUS_LABELS[building.status]}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {building.width}m × {building.depth}m × {building.height}m
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <div className="text-xs text-gray-500">
                    <p>💾 Dados armazenados localmente</p>
                </div>
            </div>
        </aside>
    );
}
