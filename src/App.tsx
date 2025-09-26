import { useState, useCallback, useEffect } from 'react';
import { GameBoard } from './components/GameBoard';
import { UnitRoster } from './components/UnitRoster';
import { GameHUD } from './components/GameHUD';
import { CombatResolver } from './components/CombatResolver';
import { CombatView } from './components/CombatView';
import { calculateMovableTiles } from './services/MovementService';
import { findAttackableTargets } from './services/CombatService';

export interface Unit {
  id: string;
  name: string;
  type: 'legionnaire' | 'hastati' | 'triarii' | 'archer';
  health: number;
  maxHealth: number;
  morale: number;
  position: { x: number; y: number };
  isSelected: boolean;
  abilityUsed?: boolean;
}

export default function App() {
  const [units, setUnits] = useState<Unit[]>([
    { id: '1', name: 'Marcus Aurelius', type: 'legionnaire', health: 100, maxHealth: 100, morale: 85, position: { x: 2, y: 3 }, isSelected: false },
    { id: '2', name: 'Gaius Brutus', type: 'hastati', health: 90, maxHealth: 100, morale: 78, position: { x: 3, y: 3 }, isSelected: false, abilityUsed: false },
    { id: '3', name: 'Lucius Maximus', type: 'triarii', health: 95, maxHealth: 100, morale: 92, position: { x: 4, y: 3 }, isSelected: false },
    { id: '4', name: 'Quintus Archer', type: 'archer', health: 75, maxHealth: 80, morale: 65, position: { x: 1, y: 4 }, isSelected: false },
    { id: 'enemy1', name: 'Barbarian Warrior', type: 'hastati', health: 85, maxHealth: 100, morale: 70, position: { x: 8, y: 8 }, isSelected: false },
    { id: 'enemy2', name: 'Celtic Archer', type: 'archer', health: 65, maxHealth: 80, morale: 60, position: { x: 9, y: 7 }, isSelected: false }
  ]);
  const [movableTiles, setMovableTiles] = useState<{ x: number; y: number }[]>([]);
  const [attackableTiles, setAttackableTiles] = useState<Unit[]>([]);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [playerRank, setPlayerRank] = useState('Decanus');
  const [leadership, setLeadership] = useState(12);
  const [experience, setExperience] = useState(180);
  const [maxExperience, setMaxExperience] = useState(250);
  const [turnNumber, setTurnNumber] = useState(1);
  const [missionObjective, setMissionObjective] = useState('Secure the crossroads');
  const [missionProgress, setMissionProgress] = useState(25);
  const [combatActive, setCombatActive] = useState(false);
  const [combatViewActive, setCombatViewActive] = useState(false);
  const [combatData, setCombatData] = useState<{ attacker: Unit | null; defender: Unit | null }>({ attacker: null, defender: null });

  useEffect(() => {
    if (combatData.attacker && combatData.defender) {
      setCombatActive(true);
    }
  }, [combatData]);

  const selectedUnit = units.find(unit => unit.isSelected) || null;

  const handleUnitSelect = useCallback((unitId: string) => {
    setUnits(prev => prev.map(unit => ({ ...unit, isSelected: unit.id === unitId ? !unit.isSelected : false })));
    setSelectedAction(null);
    setMovableTiles([]);
    setAttackableTiles([]);
  }, []);

  const handleSelectAll = useCallback(() => {
    setUnits(prev => prev.map(unit => ({ ...unit, isSelected: true })));
  }, []);

  const handleMoveUnit = useCallback((unitId: string, newPosition: { x: number; y: number }) => {
    const newUnits = units.map(unit => 
      unit.id === unitId ? { ...unit, position: newPosition } : unit
    );
    setUnits(newUnits);

    const movedUnit = newUnits.find(u => u.id === unitId);
    if (!movedUnit) return;

    const isPlayerUnit = !movedUnit.id.startsWith('enemy');
    
    const nearbyEnemies = newUnits.filter(u => 
      (isPlayerUnit ? u.id.startsWith('enemy') : !u.id.startsWith('enemy')) &&
      Math.abs(u.position.x - newPosition.x) <= 1 && 
      Math.abs(u.position.y - newPosition.y) <= 1
    );
    
    if (nearbyEnemies.length > 0) {
      setCombatData({ attacker: movedUnit, defender: nearbyEnemies[0] });
    }
    
    setSelectedAction(null);
    setMovableTiles([]);
    setExperience(prev => Math.min(maxExperience, prev + 5));
  }, [units, maxExperience]);

  const handleActionSelect = useCallback((action: string) => {
    const newAction = selectedAction === action ? null : action;
    setSelectedAction(newAction);
    setMovableTiles([]);
    setAttackableTiles([]);

    if (newAction === 'move' && selectedUnit) {
      const range = 2;
      const tiles = calculateMovableTiles(selectedUnit.position, range);
      setMovableTiles(tiles);
    } else if (newAction === 'pila_toss' && selectedUnit) {
      const attackRange = 4;
      const targets = findAttackableTargets(selectedUnit, units, attackRange);
      setAttackableTiles(targets);
    }
  }, [selectedAction, selectedUnit, units]);
  
  const handleAbilityUse = useCallback((targetUnit: Unit) => {
    if (!selectedUnit || !selectedAction) return;

    if (selectedAction === 'pila_toss') {
      const newUnits = units.map(u => u.id === selectedUnit.id ? { ...u, abilityUsed: true } : u);
      const updatedAttacker = newUnits.find(u => u.id === selectedUnit.id);
      
      setUnits(newUnits);
      if (updatedAttacker) {
        setCombatData({ attacker: updatedAttacker, defender: targetUnit });
      }
    }
  }, [selectedUnit, selectedAction, units]);

  const handleEndTurn = useCallback(() => { /* ... Omitted for brevity ... */ }, []);

  const handleCombatComplete = useCallback((result: any) => {
    const { attackerDamage, defenderDamage, attackerMoraleChange, defenderMoraleChange } = result;
    setUnits(prev => prev.map((unit: Unit) => {
      if (unit.id === combatData.attacker?.id) { return { ...unit, health: Math.max(0, unit.health - attackerDamage), morale: Math.max(0, Math.min(100, unit.morale + attackerMoraleChange)) }; }
      if (unit.id === combatData.defender?.id) { return { ...unit, health: Math.max(0, unit.health - defenderDamage), morale: Math.max(0, Math.min(100, unit.morale + defenderMoraleChange)) }; }
      return unit;
    }));
    setExperience(prev => Math.min(maxExperience, prev + 15));
    setCombatActive(false);
    setCombatViewActive(false);
    
    setSelectedAction(null);
    setAttackableTiles([]);
    setCombatData({ attacker: null, defender: null });
  }, [combatData, maxExperience]);

  const handlePauseGame = useCallback(() => {
    console.log('Game paused!');
  }, []);

  const handleCombatAction = useCallback((action: string) => { /* ... Omitted for brevity ... */ }, [combatData]);

  return (
    <div className="h-screen flex flex-col bg-stone-100">
      <GameHUD
        playerRank={playerRank}
        leadership={leadership}
        experience={experience}
        maxExperience={maxExperience}
        turnNumber={turnNumber}
        missionObjective={missionObjective}
        missionProgress={missionProgress}
        onEndTurn={handleEndTurn}
        onPauseGame={handlePauseGame}
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
          {/* ... Campaign Status JSX ... */}
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