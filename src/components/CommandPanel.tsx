import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

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

interface CommandPanelProps {
  selectedUnit: Unit | null;
  selectedAction: string | null;
  onActionSelect: (action: string) => void;
  onFormationSelect: (formation: string) => void;
  playerRank: string;
  leadership: number;
}

export function CommandPanel({ 
  selectedUnit, 
  selectedAction, 
  onActionSelect, 
  onFormationSelect,
  playerRank,
  leadership 
}: CommandPanelProps) {
  const actions = [
    { id: 'move', name: 'Move', icon: '🚶', description: 'Move unit to new position' },
    { id: 'attack', name: 'Attack', icon: '⚔️', description: 'Attack enemy unit' },
    { id: 'defend', name: 'Defend', icon: '🛡️', description: 'Defensive stance (+defense, -movement)' },
    { id: 'charge', name: 'Charge', icon: '🏃', description: 'Charge attack (+damage, -defense)' }
  ];

  const formations = [
    { id: 'line', name: 'Line Formation', icon: '═══', description: 'Balanced offense and defense' },
    { id: 'wedge', name: 'Wedge', icon: '▲▲▲', description: 'Charge formation for breaking lines' },
    { id: 'testudo', name: 'Testudo', icon: '🐢', description: 'Shield wall for defense' },
    { id: 'column', name: 'Column', icon: '│││', description: 'Fast movement formation' }
  ];

  const getMoraleColor = (morale: number) => {
    if (morale >= 80) return 'text-green-600';
    if (morale >= 60) return 'text-yellow-600';
    if (morale >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getUnitTypeDescription = (type: string) => {
    switch (type) {
      case 'legionnaire': return 'Heavy infantry - Balanced fighter';
      case 'hastati': return 'Front line troops - High offense';
      case 'triarii': return 'Elite veterans - High defense';
      case 'archer': return 'Ranged support - Long range attacks';
      default: return 'Unknown unit type';
    }
  };

  return (
    <div className="space-y-4">
      {/* Player Status */}
      <Card className="bg-gradient-to-r from-purple-100 to-purple-200 border-purple-400">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🏛️</span>
            <div>
              <div>{playerRank}</div>
              <div className="text-sm text-purple-600">Leadership: {leadership}</div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Selected Unit Info */}
      {selectedUnit ? (
        <Card className="bg-gradient-to-r from-blue-100 to-blue-200 border-blue-400">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>{selectedUnit.name}</span>
              <Badge variant="outline" className="bg-blue-50">
                {selectedUnit.type.charAt(0).toUpperCase() + selectedUnit.type.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">{getUnitTypeDescription(selectedUnit.type)}</div>
            <div className="flex justify-between items-center">
              <span>Health:</span>
              <span className="font-medium">{selectedUnit.health}/{selectedUnit.maxHealth}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Morale:</span>
              <span className={`font-medium ${getMoraleColor(selectedUnit.morale)}`}>
                {selectedUnit.morale}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Position:</span>
              <span className="font-medium">({selectedUnit.position.x}, {selectedUnit.position.y})</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gray-100 border-gray-300">
          <CardContent className="pt-6 text-center text-gray-500">
            Select a unit to view details
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card className="bg-gradient-to-r from-red-100 to-red-200 border-red-400">
        <CardHeader className="pb-3">
          <CardTitle>Combat Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={selectedAction === action.id ? "default" : "outline"}
              className={`w-full justify-start ${selectedAction === action.id ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50'}`}
              onClick={() => onActionSelect(action.id)}
              disabled={!selectedUnit}
            >
              <span className="mr-2">{action.icon}</span>
              <div className="text-left">
                <div>{action.name}</div>
                <div className="text-xs opacity-70">{action.description}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Formations */}
      <Card className="bg-gradient-to-r from-green-100 to-green-200 border-green-400">
        <CardHeader className="pb-3">
          <CardTitle>Formations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {formations.map((formation) => (
            <Button
              key={formation.id}
              variant="outline"
              className="w-full justify-start hover:bg-green-50"
              onClick={() => onFormationSelect(formation.id)}
              disabled={!selectedUnit}
            >
              <span className="mr-2 font-mono">{formation.icon}</span>
              <div className="text-left">
                <div>{formation.name}</div>
                <div className="text-xs opacity-70">{formation.description}</div>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}