/**
 * Core type definitions for Half-Life Caffeine Tracker
 */

// Drink definition from drinks database
export interface Drink {
  manufacturer: string;
  product: string;
  category: string;
  volume_oz: number;
  caffeine_mg: number;
  labels: string[];
}

// Custom drink added by user
export interface CustomDrink extends Drink {
  isCustom: boolean;
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