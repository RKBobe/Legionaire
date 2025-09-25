# Legionaire Game - AI Agent Instructions

This document provides essential knowledge for AI agents working with the Legionaire game codebase.

## Project Overview

Legionaire is a turn-based strategy game built with React and TypeScript, featuring Roman legion combat mechanics. The game uses a component-based architecture with Radix UI primitives for the interface.

## Core Architecture

### Key Components

- `App.tsx`: Main application container managing game state and coordination between components
- `GameBoard`: Central game grid component handling unit placement and movement
- `UnitRoster`: Manages unit selection and status display
- `CombatResolver` & `CombatView`: Handles combat interactions and visualization
- `GameHUD`: Displays player stats, mission objectives, and game controls

### Data Flow

1. Core game state (units, turns, player stats) managed in `App.tsx`
2. Actions flow up through handler functions (e.g., `handleUnitSelect`, `handleMoveUnit`)
3. State changes propagate down through props to child components

## Key Data Structures

### Unit Interface
```typescript
interface Unit {
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
```

## Game Mechanics

### Unit Movement
- Movement range: 2 tiles in any direction (Manhattan distance)
- Combat triggers automatically when moving adjacent to enemies

### Combat System
- Utilizes morale and health stats
- Special abilities like "pila_toss" (range: 4 tiles)
- Combat resolution handled through `CombatResolver` component

## Development Workflow

### Setup
```bash
npm i         # Install dependencies
npm run dev   # Start development server
```

### Component Structure
- UI components use Radix primitives (`src/components/ui/`)
- Game-specific components in `src/components/`
- Styles utilize Tailwind with custom gradients/colors

## Conventions

### State Management
- Use React's useState for component-level state
- Prop drilling for deeper component communication
- Callbacks prefixed with "handle" for event handlers

### Component Patterns
1. Game state modifications happen in `App.tsx`
2. Child components receive handlers for actions
3. Use controlled components for game pieces

## Common Tasks

### Adding a New Unit Type
1. Update Unit interface type union in `App.tsx`
2. Add initial state to units array
3. Implement type-specific logic in combat resolver

### Implementing New Abilities
1. Add ability flag to Unit interface
2. Create handler in `App.tsx`
3. Add UI trigger in relevant component
4. Implement resolution logic in `CombatResolver`