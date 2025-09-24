import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Unit {
  id: string;
  name: string;
  type: 'legionnaire' | 'hastati' | 'triarii' | 'archer';
  health: number;
  maxHealth: number;
  morale: number;
  position: { x: number; y: number };
  isSelected: boolean;
}

interface GameBoardProps {
  units: Unit[];
  onUnitSelect: (unitId: string) => void;
  onMoveUnit: (unitId: string, position: { x: number; y: number }) => void;
  selectedAction: string | null;
}

export function GameBoard({ units, onUnitSelect, onMoveUnit, selectedAction }: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const gridSize = 12;
  const cellSize = 40;

  const handleCellClick = (x: number, y: number) => {
    const selectedUnit = units.find(unit => unit.isSelected);
    if (selectedUnit && selectedAction === 'move') {
      onMoveUnit(selectedUnit.id, { x, y });
    }
  };

  const getUnitTypeColor = (type: Unit['type']) => {
    switch (type) {
      case 'legionnaire': return 'bg-red-600';
      case 'hastati': return 'bg-blue-600';
      case 'triarii': return 'bg-purple-600';
      case 'archer': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getUnitTypeSymbol = (type: Unit['type']) => {
    switch (type) {
      case 'legionnaire': return '🛡️';
      case 'hastati': return '⚔️';
      case 'triarii': return '🏛️';
      case 'archer': return '🏹';
      default: return '👤';
    }
  };

  return (
    <div className="bg-amber-50 border-4 border-amber-800 rounded-lg p-4">
      <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-700 rounded">
        <svg
          width={gridSize * cellSize}
          height={gridSize * cellSize}
          className="block"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width={cellSize}
              height={cellSize}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`}
                fill="none"
                stroke="#d97706"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
          />

          {/* Grid cells for interaction */}
          {Array.from({ length: gridSize }).map((_, x) =>
            Array.from({ length: gridSize }).map((_, y) => (
              <rect
                key={`${x}-${y}`}
                x={x * cellSize}
                y={y * cellSize}
                width={cellSize}
                height={cellSize}
                fill={hoveredCell?.x === x && hoveredCell?.y === y ? "rgba(217, 119, 6, 0.2)" : "transparent"}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredCell({ x, y })}
                onMouseLeave={() => setHoveredCell(null)}
                onClick={() => handleCellClick(x, y)}
              />
            ))
          )}

          {/* Units */}
          {units.map((unit) => (
            <g key={unit.id}>
              <circle
                cx={unit.position.x * cellSize + cellSize / 2}
                cy={unit.position.y * cellSize + cellSize / 2}
                r={cellSize / 3}
                className={`${getUnitTypeColor(unit.type)} ${unit.isSelected ? 'stroke-yellow-400 stroke-4' : 'stroke-amber-800 stroke-2'} cursor-pointer`}
                onClick={() => onUnitSelect(unit.id)}
              />
              <text
                x={unit.position.x * cellSize + cellSize / 2}
                y={unit.position.y * cellSize + cellSize / 2 + 6}
                textAnchor="middle"
                className="text-white pointer-events-none select-none"
                style={{ fontSize: '16px' }}
              >
                {getUnitTypeSymbol(unit.type)}
              </text>
              
              {/* Health bar */}
              <rect
                x={unit.position.x * cellSize + 4}
                y={unit.position.y * cellSize + 2}
                width={cellSize - 8}
                height={4}
                fill="rgba(0, 0, 0, 0.3)"
                rx="2"
              />
              <rect
                x={unit.position.x * cellSize + 4}
                y={unit.position.y * cellSize + 2}
                width={(cellSize - 8) * (unit.health / unit.maxHealth)}
                height={4}
                fill={unit.health > unit.maxHealth * 0.6 ? "#10b981" : unit.health > unit.maxHealth * 0.3 ? "#f59e0b" : "#ef4444"}
                rx="2"
              />
            </g>
          ))}
        </svg>
      </div>
      
      <div className="mt-4 flex gap-2 flex-wrap">
        <Badge variant="outline" className="bg-amber-100">
          Grid: {gridSize}x{gridSize} | Roman Battlefield
        </Badge>
        {selectedAction && (
          <Badge className="bg-red-600">
            Action: {selectedAction.toUpperCase()}
          </Badge>
        )}
      </div>
    </div>
  );
}