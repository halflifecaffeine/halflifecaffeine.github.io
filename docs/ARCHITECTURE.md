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
│   ├── common/       # Shared UI components used across features
│   │   ├── displays/ # Display-oriented components (e.g., ThemeAwarePagination)
│   │   ├── forms/    # Form-related components 
│   │   ├── layout/   # Layout components (SlideoutPanel, etc.)
│   │   └── modals/   # Modal dialog components (DeleteConfirmation, etc.)
│   ├── dashboard/    # Data visualization and summary components
│   ├── drinks/       # Drinks management components
│   ├── intake/       # Caffeine intake management components
│   ├── layout/       # Global layout components (Header, Footer)
│   └── settings/     # User preferences and settings components
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

### Dashboard Components

The main visualization and summary components that display:
- Current caffeine levels (CurrentCaffeineDonut)
- Historical and projected caffeine data (CaffeineChart)
- Health information based on caffeine levels (CaffeineHealthInfo)
- Tabular data view of intake records (CaffeineTable)

### Drinks Management

A modular system for managing drink entries:
- DrinkBrowser: Searchable, filterable display of available drinks
- Specialized slideout components for different operations:
  - DrinkAddSlideout: Adding new drinks
  - DrinkEditSlideout: Editing existing drinks
  - DrinkCloneSlideout: Cloning existing drinks
  - DrinkDeleteConfirmation: Confirming drink deletion
- DrinkForm: Reusable form component for drink data entry

### Intake Management

Similar modular system for managing caffeine intake:
- IntakeBrowser: Searchable, sortable, paginated table of intake records
- Specialized slideout components:
  - IntakeAddSlideout: Adding new intake records
  - IntakeEditSlideout: Editing existing records
  - IntakeCloneSlideout: Cloning existing records
  - IntakeDeleteConfirmation: Confirming intake deletion
- IntakeForm: Reusable form component for intake data entry
- IntakeWelcomeCard: Displayed when no intake records exist

## Data Schema

### CaffeineIntake

```typescript
interface CaffeineIntake {
  id: string;
  datetime: string; // ISO format date string
  drink: Drink;
  volume: number;
  unit: VolumeUnit; // 'oz' | 'ml' | 'cup' | 'quart' | 'gallon'
  mg: number; // Total caffeine in milligrams
  notes?: string;
}
```

### Drink

```typescript
interface Drink {
  id?: string; // Only for custom drinks
  brand: string; // Previously called "manufacturer"
  product: string;
  category: string;
  caffeine_mg_per_oz: number; // Caffeine concentration
  default_size_in_oz: number; // Default serving size
  labels?: string[];
  user_entered?: boolean; // Flag for custom drinks
}
```

### UserPreferences

```typescript
interface UserPreferences {
  halfLifeHours: number;
  maxSafeCaffeineLevel: number;
  sleepCaffeineThreshold: number;
  sleepStartHour: number;
  theme: 'light' | 'dark' | 'auto';
}
```

## Extending the Application

When adding new features, consider:

1. **State Management**: Use AppContext for global state, component state for UI-specific state
2. **Component Organization**: Follow the established pattern of specialized components with single responsibilities
3. **New Components**: Create in the appropriate directory with proper TypeScript typing
4. **New Features**: Consider mobile and desktop experiences
5. **Calculations**: Add to the engine/ directory with proper unit tests
6. **Data Storage**: Update storage schema carefully to ensure backward compatibility

## Performance Considerations

- Use memoization (useMemo, useCallback) for expensive calculations
- Virtualize long lists of data
- Optimize chart rendering for mobile devices
- Consider bundle size when adding dependencies