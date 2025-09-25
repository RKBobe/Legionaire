import { useState, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { UnitRoster } from './components/UnitRoster';
import { GameHUD } from './components/GameHUD';
import { CombatResolver } from './components/CombatResolver';
import { CombatView } from './components/CombatView';

// Exporting the Unit type so other components can use it
export interface Unit {
  id: string;
  name: string;
  type: 'legionnaire' | 'hastati' | 'triarii' | 'archer';
  health: number;
  maxHealth: number;
  morale: number;
  position: { x: number; y: number };
  isSelected: boolean;
  abilityUsed?: boolean; // New property to track ability usage
}

export default function App() {
  const [units, setUnits] = useState<Unit[]>([
    {
      id: '1',
      name: 'Marcus Aurelius',
      type: 'legionnaire',
      health: 100,
      maxHealth: 100,
      morale: 85,
      position: { x: 2, y: 3 },
      isSelected: false,
    },
    {
      id: '2',
      name: 'Gaius Brutus',
      type: 'hastati',
      health: 90,
      maxHealth: 100,
      morale: 78,
      position: { x: 3, y: 3 },
      isSelected: false,
      abilityUsed: false, // Initialize for our new ability
    },
    {
      id: '3',
      name: 'Lucius Maximus',
      type: 'triarii',
      health: 95,
      maxHealth: 100,
      morale: 92,
      position: { x: 4, y: 3 },
      isSelected: false,
    },
    {
      id: '4',
      name: 'Quintus Archer',
      type: 'archer',
      health: 75,
      maxHealth: 80,
      morale: 65,
      position: { x: 1, y: 4 },
      isSelected: false,
    },
    // Enemy units for testing combat
    {
      id: 'enemy1',
      name: 'Barbarian Warrior',
      type: 'hastati',
      health: 85,
      maxHealth: 100,
      morale: 70,
      position: { x: 8, y: 8 },
      isSelected: false,
    },
    {
      id: 'enemy2',
      name: 'Celtic Archer',
      type: 'archer',
      health: 65,
      maxHealth: 80,
      morale: 60,
      position: { x: 9, y: 7 },
      isSelected: false,
    }
  ]);
  const [movableTiles, setMovableTiles] = useState<{ x: number; y: number }[]>([]);
  const [attackableTiles, setAttackableTiles] = useState<Unit[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [playerRank, setPlayerRank] = useState('Decanus');
  const [leadership, setLeadership] = useState(12);
  const [experience, setExperience] = useState(180);
  const [maxExperience, setMaxExperience] = useState(250);
  const [turnNumber, setTurnNumber] = useState(1);
  const [missionObjective] = useState('Secure the crossroads and eliminate enemy resistance');
  const [missionProgress, setMissionProgress] = useState(25);
  const [combatActive, setCombatActive] = useState(false);
  const [combatViewActive, setCombatViewActive] = useState(false);
  const [combatData, setCombatData] = useState<{ attacker: Unit | null; defender: Unit | null }>({
    attacker: null,
    defender: null
  });

  const selectedUnit = units.find(unit => unit.isSelected) || null;

  const handleUnitSelect = useCallback((unitId: string) => {
    setUnits(prev => prev.map(unit => ({
      ...unit,
      isSelected: unit.id === unitId ? !unit.isSelected : false
    })));
    setSelectedAction(null);
    setMovableTiles([]);
    setAttackableTiles([]);
  }, []);

  const handleSelectAll = useCallback(() => {
    setUnits(prev => prev.map(unit => ({
      ...unit,
      isSelected: true
    })));
  }, []);

  const handleMoveUnit = useCallback((unitId: string, newPosition: { x: number; y: number }) => {
    setUnits(prev => prev.map(unit =>
      unit.id === unitId ? { ...unit, position: newPosition } : unit
    ));
    setSelectedAction(null);
    setMovableTiles([]);
    
    const movedUnit = units.find(u => u.id === unitId);
    const nearbyEnemies = units.filter(u =>
      u.id !== unitId && !u.id.startsWith('enemy') &&
      Math.abs(u.position.x - newPosition.x) <= 1 &&
      Math.abs(u.position.y - newPosition.y) <= 1
    );
    
    if (nearbyEnemies.length > 0 && movedUnit) {
      setCombatData({ attacker: movedUnit, defender: nearbyEnemies[0] });
      setCombatActive(true);
    }
    
    setExperience(prev => Math.min(maxExperience, prev + 5));
  }, [maxExperience, units]);

  const handleActionSelect = useCallback((action: string) => {
    const newAction = selectedAction === action ? null : action;
    setSelectedAction(newAction);

    setMovableTiles([]);
    setAttackableTiles([]);

    if (newAction === 'move' && selectedUnit) {
      const range = 2;
      const tiles = [];
      for (let x = -range; x <= range; x++) {
        for (let y = -range; y <= range; y++) {
          if (Math.abs(x) + Math.abs(y) <= range) {
            const newX = selectedUnit.position.x + x;
            const newY = selectedUnit.position.y + y;
            if (newX >= 0 && newX < 12 && newY >= 0 && newY < 12) {
              tiles.push({ x: newX, y: newY });
            }
          }
        }
      }
      setMovableTiles(tiles);
    } else if (newAction === 'pila_toss' && selectedUnit) {
      const attackRange = 4;
      const targets = units.filter(unit => 
        !unit.id.startsWith('enemy') !== !selectedUnit.id.startsWith('enemy') &&
        Math.abs(unit.position.x - selectedUnit.position.x) + 
        Math.abs(unit.position.y - selectedUnit.position.y) <= attackRange
      );
      setAttackableTiles(targets);
    }
  }, [selectedAction, selectedUnit, units]);
  
  const handleAbilityUse = useCallback((targetUnit: Unit) => {
    if (!selectedUnit || !selectedAction) return;
    
    if (selectedAction === 'pila_toss') {
      setCombatData({ attacker: selectedUnit, defender: targetUnit });
      setCombatActive(true);

      setUnits(prevUnits => prevUnits.map(u => 
        u.id === selectedUnit.id ? { ...u, abilityUsed: true } : u
      ));
    }
    
    setSelectedAction(null);
    setAttackableTiles([]);
  }, [selectedUnit, selectedAction]);

  const handleEndTurn = useCallback(() => {
    setTurnNumber(prev => prev + 1);
    setMissionProgress(prev => Math.min(100, prev + 5));
    
    setUnits(prev => prev.map(unit => ({
      ...unit,
      morale: Math.max(20, Math.min(100, unit.morale + (Math.random() > 0.5 ? 1 : -1))),
      isSelected: false
    })));
    
    setSelectedAction(null);
    setMovableTiles([]);
    setAttackableTiles([]);
  }, []);

  const handleCombatComplete = useCallback((result: any) => {
    const { attackerDamage, defenderDamage, attackerMoraleChange, defenderMoraleChange } = result;
    
    setUnits(prev => prev.map((unit: Unit) => {
      if (unit.id === combatData.attacker?.id) {
        return { ...unit, health: Math.max(0, unit.health - attackerDamage), morale: Math.max(0, Math.min(100, unit.morale + attackerMoraleChange)) };
      }
      if (unit.id === combatData.defender?.id) {
        return { ...unit, health: Math.max(0, unit.health - defenderDamage), morale: Math.max(0, Math.min(100, unit.morale + defenderMoraleChange)) };
      }
      return unit;
    }));

    setExperience(prev => Math.min(maxExperience, prev + 15));
    
    setCombatActive(false);
    setCombatViewActive(false);
  }, [combatData, maxExperience]);

  const handleCombatAction = useCallback((action: string) => {
    console.log(`Combat action: ${action}`);
    if (action === 'attack') {
      setUnits(prev => prev.map((unit: Unit) => {
        if (unit.id === combatData.defender?.id) {
          return { ...unit, health: Math.max(0, unit.health - 15) };
        }
        return unit;
      }));
    }
  }, [combatData]);

  return (
    <div className="h-screen flex flex-col bg-stone-100">
      <GameHUD
        playerRank={playerRank} leadership={leadership} experience={experience}
        maxExperience={maxExperience} turnNumber={turnNumber} missionObjective={missionObjective}
        missionProgress={missionProgress} onEndTurn={handleEndTurn}
        onPauseGame={() => console.log('Game paused')}
      />

      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        <div className="w-80 space-y-4">
          <UnitRoster units={units} onUnitSelect={handleUnitSelect} onSelectAll={handleSelectAll} />
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <GameBoard
            units={units} onUnitSelect={handleUnitSelect} onMoveUnit={handleMoveUnit}
            selectedAction={selectedAction} movableTiles={movableTiles}
            attackableTiles={attackableTiles} onAbilityUse={handleAbilityUse}
            onActionSelect={handleActionSelect}
          />
        </div>

        <div className="w-80 bg-gradient-to-b from-stone-200 to-stone-300 rounded-lg p-4 border-2 border-stone-400">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📜</span> Campaign Status
          </h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white rounded border">
              <div className="font-medium">Current Mission</div>
              <div className="text-gray-600">{missionObjective}</div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="font-medium">Legion Status</div>
              <div className="text-gray-600">
                Units: {units.length}/10<br/>
                Average Morale: {Math.round(units.reduce((acc: number, unit: Unit) => acc + unit.morale, 0) / units.length)}%<br/>
                Casualties: 0
              </div>
            </div>
            <div className="p-3 bg-white rounded border">
              <div className="font-medium">Next Rank: Optio</div>
              <div className="text-gray-600">
                Requirements: 250 XP, Complete 3 missions, Lead 8+ units
              </div>
            </div>
          </div>
        </div>
      </div>

      <CombatResolver
        isActive={combatActive} attacker={combatData.attacker} defender={combatData.defender}
        actionType={selectedAction} onCombatComplete={handleCombatComplete}
        onCancel={() => setCombatActive(false)}
      />

      <CombatView
        isActive={combatViewActive} attacker={combatData.attacker} defender={combatData.defender}
        onExitCombat={() => setCombatViewActive(false)} onCombatAction={handleCombatAction}
      />
    </div>
  );
}