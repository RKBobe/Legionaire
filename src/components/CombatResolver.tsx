import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface CombatResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerMoraleChange: number;
  defenderMoraleChange: number;
  outcome: 'victory' | 'defeat' | 'draw';
}

interface CombatResolverProps {
  isActive: boolean;
  attacker: any;
  defender: any;
  onCombatComplete: (result: CombatResult) => void;
  onCancel: () => void;
}

export function CombatResolver({ isActive, attacker, defender, onCombatComplete, onCancel }: CombatResolverProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  if (!isActive || !attacker || !defender) {
    return null;
  }

  const calculateCombat = () => {
    setIsResolving(true);
    setCombatLog([]);

    // Simulate combat resolution with Roman military tactics
    const log: string[] = [];
    
    // Calculate base attack and defense values
    const attackerStrength = getUnitStrength(attacker);
    const defenderStrength = getUnitStrength(defender);
    
    log.push(`${attacker.name} (${attackerStrength} strength) attacks ${defender.name} (${defenderStrength} strength)`);
    
    // Add randomness and tactical modifiers
    const attackRoll = Math.floor(Math.random() * 20) + 1;
    const defenseRoll = Math.floor(Math.random() * 20) + 1;
    
    log.push(`Attack roll: ${attackRoll} | Defense roll: ${defenseRoll}`);
    
    // Calculate damage
    let attackerDamage = 0;
    let defenderDamage = 0;
    let attackerMoraleChange = 0;
    let defenderMoraleChange = 0;
    let outcome: 'victory' | 'defeat' | 'draw' = 'draw';
    
    if (attackRoll + attackerStrength > defenseRoll + defenderStrength) {
      defenderDamage = Math.floor(Math.random() * 15) + 5;
      attackerMoraleChange = 5;
      defenderMoraleChange = -10;
      outcome = 'victory';
      log.push(`${attacker.name} strikes true! ${defender.name} takes ${defenderDamage} damage.`);
    } else if (defenseRoll + defenderStrength > attackRoll + attackerStrength) {
      attackerDamage = Math.floor(Math.random() * 10) + 3;
      attackerMoraleChange = -5;
      defenderMoraleChange = 3;
      outcome = 'defeat';
      log.push(`${defender.name} counters! ${attacker.name} takes ${attackerDamage} damage.`);
    } else {
      attackerDamage = Math.floor(Math.random() * 5) + 1;
      defenderDamage = Math.floor(Math.random() * 5) + 1;
      attackerMoraleChange = -2;
      defenderMoraleChange = -2;
      log.push(`Both warriors clash! Each takes minor damage.`);
    }

    // Apply tactical bonuses
    if (attacker.type === 'hastati' && outcome === 'victory') {
      log.push(`Hastati bonus: Extra damage from aggressive combat!`);
      defenderDamage += 3;
    }
    
    if (defender.type === 'triarii' && outcome === 'defeat') {
      log.push(`Triarii resilience: Damage reduced by veteran training!`);
      attackerDamage = Math.max(1, attackerDamage - 3);
    }

    setCombatLog(log);

    // Simulate combat animation delay
    setTimeout(() => {
      setIsResolving(false);
      onCombatComplete({
        attackerDamage,
        defenderDamage,
        attackerMoraleChange,
        defenderMoraleChange,
        outcome
      });
    }, 2000);
  };

  const getUnitStrength = (unit: any) => {
    const baseStrength = {
      'legionnaire': 8,
      'hastati': 10,
      'triarii': 9,
      'archer': 6
    }[unit.type] || 7;

    // Morale affects strength
    const moraleModifier = Math.floor((unit.morale - 50) / 10);
    
    return Math.max(1, baseStrength + moraleModifier);
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'victory': return 'text-green-600';
      case 'defeat': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 bg-gradient-to-b from-red-100 to-red-200 border-red-400">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <span className="text-2xl">⚔️</span>
            Combat Engagement
            <span className="text-2xl">🛡️</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Combatants */}
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl mb-1">
                {attacker.type === 'legionnaire' ? '🛡️' : 
                 attacker.type === 'hastati' ? '⚔️' : 
                 attacker.type === 'triarii' ? '🏛️' : '🏹'}
              </div>
              <div className="font-bold">{attacker.name}</div>
              <Badge className="bg-red-600">{attacker.type}</Badge>
              <div className="text-sm mt-1">
                HP: {attacker.health}/{attacker.maxHealth}
              </div>
              <div className="text-sm">
                Morale: {attacker.morale}%
              </div>
            </div>
            
            <div className="text-4xl animate-pulse">
              ⚡
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-1">
                {defender.type === 'legionnaire' ? '🛡️' : 
                 defender.type === 'hastati' ? '⚔️' : 
                 defender.type === 'triarii' ? '🏛️' : '🏹'}
              </div>
              <div className="font-bold">{defender.name}</div>
              <Badge className="bg-blue-600">{defender.type}</Badge>
              <div className="text-sm mt-1">
                HP: {defender.health}/{defender.maxHealth}
              </div>
              <div className="text-sm">
                Morale: {defender.morale}%
              </div>
            </div>
          </div>

          {/* Combat Log */}
          {combatLog.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 max-h-32 overflow-y-auto">
              {combatLog.map((entry, index) => (
                <div key={index} className="text-sm mb-1">
                  {entry}
                </div>
              ))}
            </div>
          )}

          {/* Progress Bar */}
          {isResolving && (
            <div className="space-y-2">
              <div className="text-center text-sm">Entering combat view...</div>
              <Progress value={66} className="w-full" />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!isResolving ? (
              <>
                <Button 
                  onClick={calculateCombat}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  🎮 Enter Combat View
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                disabled 
                className="w-full"
              >
                Loading Combat View...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}