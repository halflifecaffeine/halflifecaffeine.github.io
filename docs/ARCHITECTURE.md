# Application Architecture

This document provides an overview of the Half-Life Caffeine Tracker application architecture to help contributors understand the codebase structure.

## Overview

Half-Life Caffeine Tracker is a React single-page application built with TypeScript, Vite, and React Bootstrap. The application uses a decoupled architecture with clearly separated concerns and follows modern React best practices with functional components and hooks.

## Core Technologies

- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and development server
- **React Bootstrap**: UI component library
- **React Router**: Client-side routing
- **Recharts**: Data visualization
- **Local Storage**: Client-side persistence

## Directory Structure

```
src/app/src/
├── components/       # Reusable UI components
│   └── layout/       # Layout components (header, footer, etc.)
├── contexts/         # React context providers
├── data/             # Static data files
├── engine/           # Core calculation logic
├── hooks/            # Custom React hooks
├── pages/            # Route-level components
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Key Components

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  User Input ├────►│ AppContext  ├────►│   Storage   │
│             │     │  (State)    │     │             │
└─────────────┘     └───────┬─────┘     └─────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │               │
                    │ Calculations  │
                    │               │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │               │
                    │ Visualization │
                    │               │
                    └───────────────┘
```

## Core Modules

### AppContext

Central state management for the application. Stores and manages:
- User caffeine intake records
- User preferences (half-life settings, sleep time)
- Custom drinks database
- UI theme/preferences

### Caffeine Calculator

The scientific engine behind the application that:
- Calculates remaining caffeine based on half-life
- Projects future caffeine levels
- Generates time-series data for visualization
- Provides health information based on current levels

### Local Storage Integration

The application persists all data locally in the user's browser using:
- `useLocalStorage` custom hook
- JSON serialization/deserialization for complex data
- Automatic data loading/saving

## UI Components

### CaffeineChart

The main visualization component that displays:
- Current caffeine levels
- Historical caffeine intake
- Projected caffeine decay
- Safe and sleep threshold indicators

### Intake Forms

Multiple user input methods:
- Text-based intake entry
- Time-grid selection
- Drink database lookup

## Data Schema

### CaffeineIntake

```typescript
interface CaffeineIntake {
  id: string;
  datetime: Date;
  mg: number;
  drinkId?: string;
  notes?: string;
}
```

### Drink

```typescript
interface Drink {
  manufacturer: string;
  product: string;
  category: string;
  volume_oz: number;
  caffeine_mg: number;
  labels: string[];
  source_url?: string;
  source_type?: string;
}
```

### UserPreferences

```typescript
interface UserPreferences {
  halfLifeHours: number;
  maxSafeCaffeineLevel: number;
  sleepCaffeineThreshold: number;
  sleepStartHour: number;
  theme: 'light' | 'dark' | 'system';
}
```

## Extending the Application

When adding new features, consider:

1. **State Management**: Use AppContext for global state, component state for UI-specific state
2. **New Components**: Create in the appropriate directory with proper TypeScript typing
3. **New Features**: Consider mobile and desktop experiences
4. **Calculations**: Add to the engine/ directory with proper unit tests
5. **Data Storage**: Update storage schema carefully to ensure backward compatibility

## Performance Considerations

- Use memoization (useMemo, useCallback) for expensive calculations
- Virtualize long lists of data
- Optimize chart rendering for mobile devices
- Consider bundle size when adding dependencies