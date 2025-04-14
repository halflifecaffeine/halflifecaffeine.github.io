# Style Guide

This document outlines the coding standards and style guidelines for contributing to the Half-Life Caffeine Tracker project.

## General Principles

- Write clean, readable, and maintainable code
- Optimize for readability over cleverness
- Be consistent with existing code patterns
- Follow TypeScript and React best practices

## TypeScript Guidelines

### Types and Interfaces

- Use explicit typing wherever possible
- Prefer interfaces for object shapes that will be extended or implemented
- Use type aliases for unions, intersections, and simpler object types
- Never use `any` type; prefer `unknown` if the type is truly indeterminate

```typescript
// Good
interface DrinkProps {
  manufacturer: string;
  product: string;
  caffeine_mg: number;
}

// Good
type CaffeineSource = 'coffee' | 'tea' | 'soda' | 'energy_drink';

// Avoid
const processDrink = (drink: any) => { /* ... */ };

// Better
const processDrink = (drink: DrinkProps) => { /* ... */ };
```

### Naming Conventions

- Use PascalCase for components, interfaces, and type aliases
- Use camelCase for variables, functions, and class instances
- Use UPPER_SNAKE_CASE for constants
- Use descriptive names that clearly communicate purpose

```typescript
// Component naming
const CaffeineChart: React.FC<CaffeineChartProps> = () => { /* ... */ };

// Interface naming
interface CaffeineIntakeData {
  datetime: Date;
  mg: number;
}

// Variable naming
const caffeineHalfLife = 5.7;

// Constants
const MAX_SAFE_CAFFEINE_LEVEL = 400;
```

## React Guidelines

### Component Structure

- One component per file
- Export components as named exports, not default exports
- Keep components focused on a single responsibility
- Extract reusable logic to custom hooks

```typescript
// components/CaffeineChart.tsx
import React from 'react';

export interface CaffeineChartProps {
  data: TimeSeriesData[];
  maxSafeLevel: number;
}

export const CaffeineChart: React.FC<CaffeineChartProps> = ({ data, maxSafeLevel }) => {
  // Component implementation
};
```

### Hooks

- Follow the Rules of Hooks
- Use dependency arrays properly in `useEffect` and `useCallback`
- Extract complex logic into custom hooks
- Name custom hooks with the `use` prefix

```typescript
// Good
import { useState, useEffect } from 'react';

function useCaffeineLevel(intakes: CaffeineIntake[], halfLifeHours: number) {
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  
  useEffect(() => {
    // Calculate caffeine level based on intakes
    // ...
  }, [intakes, halfLifeHours]);
  
  return currentLevel;
}
```

### Props

- Use destructuring for props
- Provide default values where appropriate
- Document complex props with comments

```typescript
// Good
interface ButtonProps {
  /** Text to display inside the button */
  label: string;
  /** Called when button is clicked */
  onClick: () => void;
  /** Whether the button is in loading state */
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  isLoading = false 
}) => {
  // Component implementation
};
```

## File Structure

- Group related files in subdirectories
- Keep directory structure flat where possible
- Use consistent file naming:
  - Components: `ComponentName.tsx`
  - Hooks: `useHookName.ts`
  - Types: `index.ts` (in the types directory) or adjacent to related components
  - Utilities: descriptive name like `caffeineCalculator.ts`

## CSS and Styling

- Use Bootstrap's utility classes where possible
- Prefer component composition over complex CSS
- When adding custom CSS:
  - Use semantic class names
  - Avoid deeply nested selectors
  - Mobile-first approach for responsive design

## Testing

- Write tests for all new functionality
- Follow the Arrange-Act-Assert pattern
- Test behaviors, not implementation details
- Mock external dependencies

```typescript
// Good test example
describe('caffeineCalculator', () => {
  it('correctly calculates remaining caffeine after half-life period', () => {
    // Arrange
    const initialAmount = 100;
    const hoursElapsed = 5.7;
    const halfLifeHours = 5.7;
    
    // Act
    const remaining = calculateRemainingCaffeine(initialAmount, hoursElapsed, halfLifeHours);
    
    // Assert
    expect(remaining).toBeCloseTo(50, 1);
  });
});
```

## Documentation

- Document public APIs, hooks, and complex functions
- Provide usage examples for complex components
- Use JSDoc-style comments for functions/methods
- Keep comments up-to-date with code changes

```typescript
/**
 * Calculates the remaining caffeine in the body after elapsed time
 * 
 * @param initialAmount - Initial caffeine amount in mg
 * @param hoursElapsed - Hours elapsed since intake
 * @param halfLifeHours - Caffeine half-life in hours (varies by individual)
 * @returns Remaining caffeine in mg
 */
export function calculateRemainingCaffeine(
  initialAmount: number,
  hoursElapsed: number,
  halfLifeHours: number
): number {
  // Implementation
}
```

## Git and Commit Style

- Use descriptive commit messages in the imperative mood
- Begin commit message with a category (fix:, feat:, docs:, etc.)
- Keep commits focused on a single logical change
- Reference issue numbers in commit messages

Examples:
```
feat: add caffeine half-life customization
fix: correct calculation for multiple caffeine intakes
docs: update README with new installation steps
refactor: improve performance of caffeine calculation
```

## Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes where needed
- Ensure keyboard navigation works correctly
- Maintain sufficient color contrast ratios

By following these guidelines, we maintain a consistent and high-quality codebase that's easier for everyone to contribute to and maintain.