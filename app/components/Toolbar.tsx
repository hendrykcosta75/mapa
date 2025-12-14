'use client';

interface ToolbarProps {
    mode: 'navigate' | 'draw_region' | 'add_building';
    onModeChange: (mode: 'navigate' | 'draw_region' | 'add_building') => void;
}

export default function Toolbar({ mode, onModeChange }: ToolbarProps) {
    const tools = [
        {
            id: 'navigate' as const,
            icon: '🧭',
            label: 'Navegar',
            description: 'Explorar o mapa 3D'
        },
        {
            id: 'draw_region' as const,
            icon: '✏️',
            label: 'Região',
            description: 'Desenhar uma nova região'
        },
        {
            id: 'add_building' as const,
            icon: '🏗️',
            label: 'Construção',
            description: 'Adicionar bloco 3D'
        }
    ];

    return (
        <div className="absolute top-4 right-4 z-10">
            <div className="bg-black/80 backdrop-blur-md rounded-xl p-2 shadow-2xl border border-gray-700">
                <div className="flex gap-1">
                    {tools.map((tool) => (
                        <button
                            key={tool.id}
                            onClick={() => onModeChange(tool.id)}
                            className={`
                relative group flex flex-col items-center justify-center
                w-16 h-16 rounded-lg transition-all duration-200
                ${mode === tool.id
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
              `}
                            title={tool.description}
                        >
                            <span className="text-2xl">{tool.icon}</span>
                            <span className="text-[10px] mt-1 font-medium">{tool.label}</span>

                            {/* Tooltip */}
                            <div className="
                absolute -bottom-10 left-1/2 -translate-x-1/2
                bg-black text-white text-xs px-2 py-1 rounded
                opacity-0 group-hover:opacity-100 transition-opacity
                whitespace-nowrap pointer-events-none
              ">
                                {tool.description}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
