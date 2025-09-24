import { useState, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { CommandPanel } from './components/CommandPanel';
import { UnitRoster } from './components/UnitRoster';
import { GameHUD } from './components/GameHUD';
import { CombatResolver } from './components/CombatResolver';
import { CombatView } from './components/CombatView';

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
      isSelected: false
    },
    {
      id: '2',
      name: 'Gaius Brutus',
      type: 'hastati',
      health: 90,
      maxHealth: 100,
      morale: 78,
      position: { x: 3, y: 3 },
      isSelected: false
    },
    {
      id: '3',
      name: 'Lucius Maximus',
      type: 'triarii',
      health: 95,
      maxHealth: 100,
      morale: 92,
      position: { x: 4, y: 3 },
      isSelected: false
    },
    {
      id: '4',
      name: 'Quintus Archer',
      type: 'archer',
      health: 75,
      maxHealth: 80,
      morale: 65,
      position: { x: 1, y: 4 },
      isSelected: false
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
      isSelected: false
    },
    {
      id: 'enemy2',
      name: 'Celtic Archer',
      type: 'archer',
      health: 65,
      maxHealth: 80,
      morale: 60,
      position: { x: 9, y: 7 },
      isSelected: false
    }
  ]);

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
  }, []);

  const handleSelectAll = useCallback(() => {
    setUnits(prev => prev.map(unit => ({
      ...unit,
      isSelected: true
    })));
  }, []);

  const handleMoveUnit = useCallback((unitId: string, newPosition: { x: number; y: number }) => {
    setUnits(prev => prev.map(unit => 
      unit.id === unitId 
        ? { ...unit, position: newPosition }
        : unit
    ));
    setSelectedAction(null);
    
    // Check for combat encounters
    const movedUnit = units.find(u => u.id === unitId);
    const nearbyEnemies = units.filter(u => 
      u.id !== unitId && 
      Math.abs(u.position.x - newPosition.x) <= 1 && 
      Math.abs(u.position.y - newPosition.y) <= 1
    );
    
    if (nearbyEnemies.length > 0 && movedUnit) {
      // Trigger combat
      setCombatData({ attacker: movedUnit, defender: nearbyEnemies[0] });
      setCombatActive(true);
    }
    
    // Gain experience for successful movement
    setExperience(prev => Math.min(maxExperience, prev + 5));
  }, [maxExperience, units]);

  const handleActionSelect = useCallback((action: string) => {
    setSelectedAction(selectedAction === action ? null : action);
  }, [selectedAction]);

  const handleFormationSelect = useCallback((formation: string) => {
    // Implement formation logic
    console.log(`Formation selected: ${formation}`);
    if (selectedUnit) {
      setUnits(prev => prev.map(unit => 
        unit.isSelected 
          ? { ...unit, morale: Math.min(100, unit.morale + 5) }
          : unit
      ));
    }
  }, [selectedUnit]);

  const handleEndTurn = useCallback(() => {
    setTurnNumber(prev => prev + 1);
    setMissionProgress(prev => Math.min(100, prev + 5));
    
    // Random events and unit status updates
    setUnits(prev => prev.map(unit => ({
      ...unit,
      morale: Math.max(20, Math.min(100, unit.morale + (Math.random() > 0.5 ? 1 : -1))),
      isSelected: false
    })));
    
    setSelectedAction(null);
  }, []);

  const handlePauseGame = useCallback(() => {
    console.log('Game paused');
  }, []);

  const handleCombatComplete = useCallback((result: any) => {
    const { attackerDamage, defenderDamage, attackerMoraleChange, defenderMoraleChange } = result;
    
    setUnits(prev => prev.map(unit => {
      if (unit.id === combatData.attacker?.id) {
        return {
          ...unit,
          health: Math.max(0, unit.health - attackerDamage),
          morale: Math.max(0, Math.min(100, unit.morale + attackerMoraleChange))
        };
      }
      if (unit.id === combatData.defender?.id) {
        return {
          ...unit,
          health: Math.max(0, unit.health - defenderDamage),
          morale: Math.max(0, Math.min(100, unit.morale + defenderMoraleChange))
        };
      }
      return unit;
    }));

    // Gain experience from combat
    setExperience(prev => Math.min(maxExperience, prev + 15));
    
    setCombatActive(false);
    setCombatViewActive(true); // Enter combat view
  }, [combatData, maxExperience]);

  const handleCombatCancel = useCallback(() => {
    setCombatActive(false);
    setCombatData({ attacker: null, defender: null });
  }, []);

  const handleExitCombatView = useCallback(() => {
    setCombatViewActive(false);
    setCombatData({ attacker: null, defender: null });
  }, []);

  const handleCombatAction = useCallback((action: string) => {
    console.log(`Combat action: ${action}`);
    // Handle combat actions like attack, defend, special moves
    
    // For now, simulate action effects
    if (action === 'attack') {
      setUnits(prev => prev.map(unit => {
        if (unit.id === combatData.defender?.id) {
          return {
            ...unit,
            health: Math.max(0, unit.health - 15)
          };
        }
        return unit;
      }));
    }
  }, [combatData]);

  return (
    <div className="h-screen flex flex-col bg-stone-100">
      {/* Game HUD */}
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

      {/* Main Game Area */}
      <div className="flex-1 flex gap-4 p-4">
        {/* Left Panel - Command & Roster */}
        <div className="w-80 space-y-4">
          <CommandPanel
            selectedUnit={selectedUnit}
            selectedAction={selectedAction}
            onActionSelect={handleActionSelect}
            onFormationSelect={handleFormationSelect}
            playerRank={playerRank}
            leadership={leadership}
          />
          <UnitRoster
            units={units}
            onUnitSelect={handleUnitSelect}
            onSelectAll={handleSelectAll}
          />
        </div>

        {/* Center - Game Board */}
        <div className="flex-1 flex items-center justify-center">
          <GameBoard
            units={units}
            onUnitSelect={handleUnitSelect}
            onMoveUnit={handleMoveUnit}
            selectedAction={selectedAction}
          />
        </div>

        {/* Right Panel - Additional Info */}
        <div className="w-80 bg-gradient-to-b from-stone-200 to-stone-300 rounded-lg p-4 border-2 border-stone-400">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">📜</span>
            Campaign Status
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
                Average Morale: {Math.round(units.reduce((acc, unit) => acc + unit.morale, 0) / units.length)}%<br/>
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

      {/* Combat Resolver Modal */}
      <CombatResolver
        isActive={combatActive}
        attacker={combatData.attacker}
        defender={combatData.defender}
        onCombatComplete={handleCombatComplete}
        onCancel={handleCombatCancel}
      />

      {/* 3D Combat View */}
      <CombatView
        isActive={combatViewActive}
        attacker={combatData.attacker}
        defender={combatData.defender}
        onExitCombat={handleExitCombatView}
        onCombatAction={handleCombatAction}
      />
    </div>
  );
}