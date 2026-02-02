/**
 * Core type definitions for Half-Life Caffeine Tracker
 */

// Drink related types
export interface Drink {
  brand: string;
  product: string;
  category: string;
  default_size_in_oz: number;
  caffeine_mg_per_oz: number;
}

// Custom drink extends Drink with user-entered flag and ID
export interface CustomDrink extends Drink {
  id: string;
  user_entered: boolean;
}

// Unit conversion options for volume input
export type VolumeUnit = 'oz' | 'ml' | 'cup' | 'quart' | 'gallon';

// Caffeine intake record
export interface CaffeineIntake {
  id: string;
  datetime: string;
  drink: Drink | CustomDrink;
  volume: number;
  unit: VolumeUnit;
  mg: number; // Calculated caffeine amount
  notes?: string;
}

// Time grid entry for the time grid picker
export interface TimeGridEntry {
  hour: number;
  minute: number;
  hasEntries: boolean;
  entries: CaffeineIntake[];
}

// User preferences
export interface UserPreferences {
  theme: 'auto' | 'light' | 'dark';
  halfLifeHours: number; // Default: 6
  maxSafeCaffeineLevel: number; // Default: 400
  sleepCaffeineThreshold: number; // Default: 100
  sleepStartHour: number; // Default: 22 (10 PM)
}

// Application state
export interface AppState {
  caffeineIntakes: CaffeineIntake[];
  customDrinks: CustomDrink[];
  preferences: UserPreferences;
}

// Filter options for drink lookup
export interface DrinkFilter {
  searchTerm: string;
  category: string | null;
  label: string | null;
}

// Theme context type
export interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'auto' | 'light' | 'dark') => void;
}