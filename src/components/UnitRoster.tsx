import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Button } from './ui/button';

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

interface UnitRosterProps {
  units: Unit[];
  onUnitSelect: (unitId: string) => void;
  onSelectAll: () => void;
}

export function UnitRoster({ units, onUnitSelect, onSelectAll }: UnitRosterProps) {
  const getUnitTypeColor = (type: Unit['type']) => {
    switch (type) {
      case 'legionnaire': return 'bg-red-100 text-red-800 border-red-200';
      case 'hastati': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'triarii': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'archer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (health: number, maxHealth: number) => {
    const percentage = (health / maxHealth) * 100;
    if (percentage > 75) return 'bg-green-500';
    if (percentage > 50) return 'bg-yellow-500';
    if (percentage > 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getMoraleColor = (morale: number) => {
    if (morale >= 80) return 'bg-green-500';
    if (morale >= 60) return 'bg-yellow-500';
    if (morale >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getUnitIcon = (type: Unit['type']) => {
    switch (type) {
      case 'legionnaire': return '🛡️';
      case 'hastati': return '⚔️';
      case 'triarii': return '🏛️';
      case 'archer': return '🏹';
      default: return '👤';
    }
  };

  const totalUnits = units.length;
  const healthyUnits = units.filter(unit => unit.health > unit.maxHealth * 0.5).length;
  const highMoraleUnits = units.filter(unit => unit.morale >= 70).length;

  return (
    <Card className="bg-gradient-to-b from-amber-50 to-amber-100 border-amber-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="text-2xl">⚰️</span>
            Unit Roster
          </span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onSelectAll}
            className="hover:bg-amber-100"
          >
            Select All
          </Button>
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span>Total: {totalUnits}</span>
          <span className="text-green-600">Healthy: {healthyUnits}</span>
          <span className="text-blue-600">High Morale: {highMoraleUnits}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {units.map((unit) => (
          <div
            key={unit.id}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              unit.isSelected 
                ? 'border-yellow-400 bg-yellow-50 shadow-md' 
                : 'border-amber-200 bg-white hover:border-amber-300'
            }`}
            onClick={() => onUnitSelect(unit.id)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getUnitIcon(unit.type)}</span>
                <div>
                  <div className="font-medium">{unit.name}</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getUnitTypeColor(unit.type)}`}
                  >
                    {unit.type.charAt(0).toUpperCase() + unit.type.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                ({unit.position.x}, {unit.position.y})
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs w-12">Health:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getHealthColor(unit.health, unit.maxHealth)}`}
                    style={{ width: `${(unit.health / unit.maxHealth) * 100}%` }}
                  />
                </div>
                <span className="text-xs w-8">{unit.health}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs w-12">Morale:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${getMoraleColor(unit.morale)}`}
                    style={{ width: `${unit.morale}%` }}
                  />
                </div>
                <span className="text-xs w-8">{unit.morale}%</span>
              </div>
            </div>
          </div>
        ))}
        
        {units.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No units in your command
          </div>
        )}
      </CardContent>
    </Card>
  );
}