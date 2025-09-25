// src/components/ActionWheel.tsx

import { Unit } from "../App"; // Importing our Unit type
import { Button } from "./ui/button";

interface ActionWheelProps {
  selectedUnit: Unit | null;
  onActionSelect: (action: string) => void;
}

export function ActionWheel({ selectedUnit, onActionSelect }: ActionWheelProps) {
  if (!selectedUnit) {
    return null; // Don't render anything if no unit is selected
  }

  // We will position this component with CSS later
  return (
    <div className="flex flex-col gap-2 p-2 bg-black/50 rounded-lg backdrop-blur-sm">
      
      {/* --- Action Buttons --- */}
      
      {/* Always show the Move button */}
      <Button 
        variant="outline" 
        className="text-white border-slate-400 hover:bg-slate-600"
        onClick={() => onActionSelect('move')}
      >
        Move
      </Button>
      
      {/* Conditionally show the Pila Toss button */}
      {selectedUnit.type === 'hastati' && !selectedUnit.abilityUsed && (
        <Button 
          variant="outline" 
          className="text-white border-amber-400 text-amber-400 hover:bg-amber-600 hover:text-white"
          onClick={() => onActionSelect('pila_toss')}
        >
          Pila Toss
        </Button>
      )}

      {/* We will add more action buttons here in the future */}

    </div>
  );
}