import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppState, CaffeineIntake, CustomDrink, UserPreferences } from '../types';
import { useTheme } from '../hooks/useTheme';

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'auto',
  halfLifeHours: 6,
  maxSafeCaffeineLevel: 400, // 400mg is FDA recommendation for healthy adults
  sleepCaffeineThreshold: 100,
  sleepStartHour: 22, // 10 PM
};

// Default initial state
const initialState: AppState = {
  caffeineIntakes: [],
  customDrinks: [],
  preferences: DEFAULT_PREFERENCES,
};

// Create context
type AppContextType = {
  state: AppState;
  addCaffeineIntake: (intake: CaffeineIntake) => void;
  updateCaffeineIntake: (intake: CaffeineIntake) => void;
  removeCaffeineIntake: (id: string) => void;
  clearAllIntakes: () => void;
  addCustomDrink: (drink: CustomDrink) => void;
  updateCustomDrink: (drink: CustomDrink) => void;
  removeCustomDrink: (drink: CustomDrink) => void;
  importData: (data: Partial<AppState>) => void;
  exportData: () => AppState;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  theme: 'light' | 'dark';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Use localStorage for persistent state
  const [state, setState] = useLocalStorage<AppState>('half-life-caffeine-state', initialState);
  
  // Use theme hook for theme management
  const [theme, setTheme] = useTheme();
  
  // Keep themes in sync
  useEffect(() => {
    if (state.preferences.theme !== 'auto' && 
        state.preferences.theme !== theme && 
        (state.preferences.theme === 'light' || state.preferences.theme === 'dark')) {
      setTheme(state.preferences.theme);
    }
  }, [state.preferences.theme, theme, setTheme]);

  // Add new caffeine intake
  const addCaffeineIntake = (intake: CaffeineIntake) => {
    setState({
      ...state,
      caffeineIntakes: [...state.caffeineIntakes, intake],
    });
  };

  // Update existing caffeine intake
  const updateCaffeineIntake = (updatedIntake: CaffeineIntake) => {
    setState({
      ...state,
      caffeineIntakes: state.caffeineIntakes.map(intake => 
        intake.id === updatedIntake.id ? updatedIntake : intake
      ),
    });
  };

  // Remove caffeine intake
  const removeCaffeineIntake = (id: string) => {
    setState({
      ...state,
      caffeineIntakes: state.caffeineIntakes.filter(intake => intake.id !== id),
    });
  };

  // Clear all intakes
  const clearAllIntakes = () => {
    setState({
      ...state,
      caffeineIntakes: [],
    });
  };

  // Add custom drink
  const addCustomDrink = (drink: CustomDrink) => {
    setState({
      ...state,
      customDrinks: [...state.customDrinks, drink],
    });
  };

  // Update custom drink
  const updateCustomDrink = (updatedDrink: CustomDrink) => {
    setState({
      ...state,
      customDrinks: state.customDrinks.map(drink =>
        drink.manufacturer === updatedDrink.manufacturer && 
        drink.product === updatedDrink.product 
          ? updatedDrink 
          : drink
      ),
    });
  };

  // Remove custom drink
  const removeCustomDrink = (drinkToRemove: CustomDrink) => {
    setState({
      ...state,
      customDrinks: state.customDrinks.filter(
        drink => !(drink.manufacturer === drinkToRemove.manufacturer && 
                   drink.product === drinkToRemove.product)
      ),
    });
  };

  // Import data
  const importData = (data: Partial<AppState>) => {
    setState({
      ...state,
      ...data,
      preferences: {
        ...state.preferences,
        ...(data.preferences || {}),
      },
    });
  };

  // Export data
  const exportData = () => state;

  // Update preferences
  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    setState({
      ...state,
      preferences: {
        ...state.preferences,
        ...preferences,
      },
    });
    
    // Update theme if changed
    if (preferences.theme && preferences.theme !== state.preferences.theme) {
      setTheme(preferences.theme);
    }
  };

  // Reset preferences to defaults
  const resetPreferences = () => {
    setState({
      ...state,
      preferences: DEFAULT_PREFERENCES,
    });
    setTheme(DEFAULT_PREFERENCES.theme);
  };

  const value = {
    state,
    addCaffeineIntake,
    updateCaffeineIntake,
    removeCaffeineIntake,
    clearAllIntakes,
    addCustomDrink,
    updateCustomDrink,
    removeCustomDrink,
    importData,
    exportData,
    updatePreferences,
    resetPreferences,
    theme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};