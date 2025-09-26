import { useState } from 'react';
import { Unit } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { calculateCombatOutcome, CombatResult } from '../services/CombatService';

interface CombatResolverProps {
  isActive: boolean;
  attacker: Unit | null;
  defender: Unit | null;
  actionType: string | null;
  onCombatComplete: (result: CombatResult) => void;
  onCancel: () => void;
}

export function CombatResolver({
  isActive,
  attacker,
  defender,
  actionType,
  onCombatComplete,
  onCancel,
}: CombatResolverProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [combatLog, setCombatLog] = useState<string[]>([]);

  // ## BUG FIX ##
  // This is the only check we need. If the modal isn't active, render nothing.
  if (!isActive) {
    return null;
  }

  const handleResolveClick = () => {
    // If we don't have our combatants yet for some reason, do nothing.
    if (!attacker || !defender) return;

    setIsResolving(true);
    const { result, log } = calculateCombatOutcome(attacker, defender, actionType);
    setCombatLog(log);

    setTimeout(() => {
      onCombatComplete(result);
      // Reset internal state for the next time the modal opens
      setIsResolving(false);
      setCombatLog([]);
    }, 2000);
  };

  // If the component is active, but data is missing, show a loading state.
  if (!attacker || !defender) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-96"><CardContent>Loading combat...</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 bg-gradient-to-b from-stone-100 to-stone-200 border-stone-400">
        <CardHeader>
          <CardTitle className="text-center text-2xl text-red-800">Combat!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Attacker Display */}
          <div>
            <div className="flex justify-between items-center">
              <span className="font-bold">{attacker.name}</span>
              <Badge>{attacker.type}</Badge>
            </div>
            <Progress value={(attacker.health / attacker.maxHealth) * 100} className="w-full" />
            <span className="text-sm">{attacker.health} / {attacker.maxHealth} HP</span>
          </div>

          <div className="text-center font-bold text-gray-500">VS</div>

          {/* Defender Display */}
          <div>
            <div className="flex justify-between items-center">
              <span className="font-bold">{defender.name}</span>
              <Badge variant="destructive">{defender.type}</Badge>
            </div>
            <Progress value={(defender.health / defender.maxHealth) * 100} className="w-full" />
            <span className="text-sm">{defender.health} / {defender.maxHealth} HP</span>
          </div>

          {/* Combat Log */}
          {combatLog.length > 0 && (
            <div className="text-center p-2 bg-stone-200 rounded">
              {combatLog.map((line, index) => <p key={index}>{line}</p>)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel} disabled={isResolving}>
              Cancel
            </Button>
            <Button onClick={handleResolveClick} disabled={isResolving}>
              {isResolving ? 'Resolving...' : 'Resolve Combat'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}