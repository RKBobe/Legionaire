import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

// Define types for clarity
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
  actionType: string | null; // Receive the action type
  onCombatComplete: (result: CombatResult) => void;
  onCancel: () => void;
}

export function CombatResolver({ isActive, attacker, defender, actionType, onCombatComplete, onCancel }: CombatResolverProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  if (!isActive || !attacker || !defender) {
    return null;
  }

  const resolveCombat = () => {
    setIsResolving(true);
    let result: CombatResult;

    // Check if this is a ranged attack like Pila Toss
    if (actionType === 'pila_toss') {
      const damage = Math.floor(Math.random() * 10) + 20; // Pila are strong
      setCombatLog([
        `${attacker.name} hurls a Pila at ${defender.name}!`,
        `${defender.name} takes ${damage} damage!`
      ]);
      result = {
        attackerDamage: 0, // No counter-attack
        defenderDamage: damage,
        attackerMoraleChange: 5,
        defenderMoraleChange: -15,
        outcome: 'victory',
      };
    } else {
      // Original Melee Combat Logic
      const attackerStrength = Math.max(1, 8 + Math.floor((attacker.morale - 50) / 10));
      const defenderStrength = Math.max(1, 8 + Math.floor((defender.morale - 50) / 10));
      const attackRoll = Math.floor(Math.random() * 20) + 1 + attackerStrength;
      const defenseRoll = Math.floor(Math.random() * 20) + 1 + defenderStrength;
      
      if (attackRoll > defenseRoll) {
        const damage = Math.floor(Math.random() * 15) + 5;
        setCombatLog([`Melee clash! ${attacker.name} overpowers ${defender.name}!`, `${defender.name} takes ${damage} damage.`]);
        result = { defenderDamage: damage, attackerDamage: 0, outcome: 'victory', attackerMoraleChange: 5, defenderMoraleChange: -10 };
      } else {
        const damage = Math.floor(Math.random() * 10) + 3;
        setCombatLog([`Melee clash! ${defender.name} repels the attack!`, `${attacker.name} takes ${damage} damage.`]);
        result = { defenderDamage: 0, attackerDamage: damage, outcome: 'defeat', attackerMoraleChange: -5, defenderMoraleChange: 3 };
      }
    }

    setTimeout(() => {
      setIsResolving(false);
      onCombatComplete(result);
    }, 2000);
  };

  const getUnitIcon = (type: string) => {
    switch (type) {
        case 'legionnaire': return '🛡️';
        case 'hastati': return '⚔️';
        case 'triarii': return '🏛️';
        case 'archer': return '🏹';
        default: return '👤';
    }
  }

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
            <div className="text-center w-32">
              <div className="text-2xl mb-1">{getUnitIcon(attacker.type)}</div>
              <div className="font-bold truncate">{attacker.name}</div>
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
            
            <div className="text-center w-32">
              <div className="text-2xl mb-1">{getUnitIcon(defender.type)}</div>
              <div className="font-bold truncate">{defender.name}</div>
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
          {isResolving && <Progress value={66} className="w-full" />}

          {/* Actions */}
          <div className="flex gap-2">
            {!isResolving ? (
              <>
                <Button 
                  onClick={resolveCombat}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Resolve Combat
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
                Resolving...
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}