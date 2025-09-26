import { Unit } from '../App';

// ## 1. Define clear data structures for our results.
// This makes the code predictable and easier to work with.
export interface CombatResult {
  attackerDamage: number;
  defenderDamage: number;
  attackerMoraleChange: number;
  defenderMoraleChange: number;
  // Note: The 'outcome' string was removed as it's part of the log, not the raw data.
}

export interface CombatOutcome {
  result: CombatResult;
  log: string[];
}

// ## 2. Create the pure function.
// Its only job is to perform calculations based on its inputs and return a result.
// It has NO side effects (like setting state).
export function calculateCombatOutcome(
  attacker: Unit,
  defender: Unit,
  actionType: string | null
): CombatOutcome {
  let result: CombatResult;
  let log: string[];

  // Pila Toss Logic [cite: 71]
  if (actionType === 'pila_toss') {
    const damage = Math.floor(Math.random() * 10) + 20;
    log = [
      `${attacker.name} hurls a Pila at ${defender.name}!`,
      `${defender.name} takes ${damage} damage!`,
    ];
    result = {
      attackerDamage: 0,
      defenderDamage: damage,
      attackerMoraleChange: 5,
      defenderMoraleChange: -15,
    };
  } else {
    // Melee Combat Logic [cite: 74-77]
    const attackerStrength = Math.max(1, 8 + Math.floor((attacker.morale - 50) / 10));
    const defenderStrength = Math.max(1, 8 + Math.floor((defender.morale - 50) / 10));
    const attackRoll = Math.floor(Math.random() * 20) + 1 + attackerStrength;
    const defenseRoll = Math.floor(Math.random() * 20) + 1 + defenderStrength;

    if (attackRoll > defenseRoll) {
      const damage = Math.floor(Math.random() * 15) + 5;
      log = [
        `Melee clash! ${attacker.name} overpowers ${defender.name}!`,
        `${defender.name} takes ${damage} damage.`,
      ];
      result = {
        defenderDamage: damage,
        attackerDamage: 0,
        attackerMoraleChange: 5,
        defenderMoraleChange: -10,
      };
    } else {
      const damage = Math.floor(Math.random() * 10) + 3;
      log = [
        `Melee clash! ${defender.name} repels the attack!`,
        `${attacker.name} takes ${damage} damage.`,
      ];
      result = {
        defenderDamage: 0,
        attackerDamage: damage,
        attackerMoraleChange: -5,
        defenderMoraleChange: 3,
      };
    }
  }

  // ## 3. Return a single, complete object with all the calculated data.
  return { result, log };
}
export function findAttackableTargets(
  attacker: Unit,
  allUnits: Unit[],
  range: number
): Unit[] {
  const targets = allUnits.filter(
    (unit) =>
      // Checks if the target is an enemy
    !unit.id.startsWith('enemy') !== !attacker.id.startsWith('enemy') &&
    // Checks if the target is within the attack range (Manhattan distance)
    Math.abs(unit.position.x - attacker.position.x) +
      Math.abs(unit.position.y - attacker.position.y) <=
      range
    );
    return targets;
}

  

