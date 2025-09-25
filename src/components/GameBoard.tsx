import { useState } from 'react';
import { Badge } from './ui/badge';
import { Unit } from '../App'; // Import the Unit type
import { ActionWheel } from './ActionWheel'; // Import our new component

interface GameBoardProps {
  units: Unit[];
  selectedAction: string | null;
  movableTiles: { x: number; y: number }[];
  attackableTiles: Unit[]; // <-- New prop
  onUnitSelect: (unitId: string) => void;
  onMoveUnit: (unitId: string, position: { x: number; y: number }) => void;
  onAbilityUse: (targetUnit: Unit) => void; // <-- New prop
  onActionSelect: (action: string) => void; // Pass this down for the wheel
}

export function GameBoard({ 
  units, 
  onUnitSelect, 
  onMoveUnit, 
  selectedAction, 
  movableTiles,
  attackableTiles,
  onAbilityUse,
  onActionSelect,
}: GameBoardProps) {
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const gridSize = 12;
  const cellSize = 40;
  const selectedUnit = units.find(u => u.isSelected) || null;

  const handleCellClick = (x: number, y: number) => {
    // Check if there's an attackable unit on this cell
    const targetUnit = attackableTiles.find(u => u.position.x === x && u.position.y === y);
    if (selectedAction === 'pila_toss' && targetUnit) {
      onAbilityUse(targetUnit);
      return; // End the click action here
    }

    // Check if the clicked tile is a valid move destination
    const isMovable = movableTiles.some(tile => tile.x === x && tile.y === y);
    if (selectedUnit && selectedAction === 'move' && isMovable) {
      onMoveUnit(selectedUnit.id, { x, y });
    }
  };

  // Helper functions for unit colors and symbols remain the same...
  const getUnitTypeColor = (type: Unit['type']) => {
    switch (type) {
      case 'legionnaire': return 'fill-red-600';
      case 'hastati': return 'fill-blue-600';
      case 'triarii': return 'fill-purple-600';
      case 'archer': return 'fill-green-600';
      default: return 'fill-gray-600';
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
    <div className="relative"> {/* Add relative positioning for the ActionWheel */}
      <div className="bg-amber-50 border-4 border-amber-800 rounded-lg p-4 shadow-xl">
        <div className="relative bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-700 rounded">
          <svg
            width={gridSize * cellSize}
            height={gridSize * cellSize}
            className="block"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
                <path d={`M ${cellSize} 0 L 0 0 0 ${cellSize}`} fill="none" stroke="#d97706" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)"/>

            {/* Movable Tiles Highlight (Blue) */}
            {movableTiles.map(tile => (
              <rect key={`movable-${tile.x}-${tile.y}`} x={tile.x * cellSize} y={tile.y * cellSize} width={cellSize} height={cellSize} fill="rgba(59, 130, 246, 0.4)" className="pointer-events-none"/>
            ))}

            {/* --- NEW: Attackable Tiles Highlight (Red) --- */}
            {attackableTiles.map(unit => (
              <rect key={`attackable-${unit.id}`} x={unit.position.x * cellSize} y={unit.position.y * cellSize} width={cellSize} height={cellSize} fill="rgba(239, 68, 68, 0.5)" className="pointer-events-none"/>
            ))}
            {/* ------------------------------------------- */}

            {/* Grid cells for interaction */}
            {Array.from({ length: gridSize }).map((_, y) =>
              Array.from({ length: gridSize }).map((_, x) => {
                const unitOnCell = units.find(u => u.position.x === x && u.position.y === y);
                return (
                  <rect
                    key={`cell-${x}-${y}`}
                    x={x * cellSize}
                    y={y * cellSize}
                    width={cellSize}
                    height={cellSize}
                    fill={hoveredCell?.x === x && hoveredCell?.y === y ? "rgba(217, 119, 6, 0.2)" : "transparent"}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredCell({ x, y })}
                    onMouseLeave={() => setHoveredCell(null)}
                    onClick={() => {
                        if (unitOnCell) {
                            onUnitSelect(unitOnCell.id);
                        } else {
                            handleCellClick(x, y);
                        }
                    }}
                  />
                )
              })
            )}

            {/* Units */}
            {units.map((unit) => (
              <g key={unit.id} className="transition-transform duration-300">
                <circle cx={unit.position.x * cellSize + cellSize / 2} cy={unit.position.y * cellSize + cellSize / 2} r={cellSize / 3} className={`${getUnitTypeColor(unit.type)} ${unit.isSelected ? 'stroke-yellow-400 stroke-4' : 'stroke-amber-800 stroke-2'} cursor-pointer transition-all`} onClick={() => onUnitSelect(unit.id)}/>
                <text x={unit.position.x * cellSize + cellSize / 2} y={unit.position.y * cellSize + cellSize / 2 + 6} textAnchor="middle" className="fill-white pointer-events-none select-none" style={{ fontSize: '16px' }}>
                  {getUnitTypeSymbol(unit.type)}
                </text>
                <rect x={unit.position.x * cellSize + 4} y={unit.position.y * cellSize + 2} width={cellSize - 8} height={4} fill="rgba(0, 0, 0, 0.3)" rx="2"/>
                <rect x={unit.position.x * cellSize + 4} y={unit.position.y * cellSize + 2} width={(cellSize - 8) * (unit.health / unit.maxHealth)} height={4} fill={unit.health > unit.maxHealth * 0.6 ? "#10b981" : unit.health > unit.maxHealth * 0.3 ? "#f59e0b" : "#ef4444"} rx="2" className="transition-width duration-500"/>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* --- NEW: Dynamically Positioned ActionWheel --- */}
      {selectedUnit && (
        <div
          className="absolute"
          style={{
            left: selectedUnit.position.x * cellSize + cellSize + 16, // Position to the right of the unit
            top: selectedUnit.position.y * cellSize + 16,            // Vertically centered
            transform: 'translateY(-50%)',
          }}
        >
          <ActionWheel selectedUnit={selectedUnit} onActionSelect={onActionSelect} />
        </div>
      )}
      {/* ------------------------------------------- */}
    </div>
  );
}