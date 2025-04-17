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
interface AppContextType {
  state: AppState;
  lastIntakeTimestamp: string | null;
  addCaffeineIntake: (intake: CaffeineIntake) => void;
  updateCaffeineIntake: (intake: CaffeineIntake) => void;
  removeCaffeineIntake: (intake: CaffeineIntake) => void;
  clearAllIntakes: () => void;
  addCustomDrink: (drink: CustomDrink) => void;
  updateCustomDrink: (drink: CustomDrink) => void;
  removeCustomDrink: (drink: CustomDrink) => void;
  importData: (data: Partial<AppState>) => void;
  importDataWithMerge: (data: { caffeineIntakes?: CaffeineIntake[], customDrinks?: CustomDrink[] }) => void;
  exportData: () => AppState;
  updatePreferences: (partialPreferences: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  resetAllData: () => void;
  theme: 'light' | 'dark';
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  // Use localStorage for persistent state
  const [state, setState] = useLocalStorage<AppState>('half-life-caffeine-state', initialState);
  
  // Add timestamp to track when intakes are modified
  const [lastIntakeTimestamp, setLastIntakeTimestamp] = useState<number>(Date.now());
  
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
    setLastIntakeTimestamp(Date.now());
  };

  // Update existing caffeine intake
  const updateCaffeineIntake = (updatedIntake: CaffeineIntake) => {
    setState({
      ...state,
      caffeineIntakes: state.caffeineIntakes.map(intake => 
        intake.id === updatedIntake.id ? updatedIntake : intake
      ),
    });
    setLastIntakeTimestamp(Date.now());
  };

  // Remove caffeine intake
  const removeCaffeineIntake = (intakeToRemove: CaffeineIntake) => {
    setState({
      ...state,
      caffeineIntakes: state.caffeineIntakes.filter(intake => intake.id !== intakeToRemove.id),
    });
    setLastIntakeTimestamp(Date.now());
  };

  // Clear all intakes
  const clearAllIntakes = () => {
    setState({
      ...state,
      caffeineIntakes: [],
    });
    setLastIntakeTimestamp(Date.now());
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
        drink.id === updatedDrink.id ? updatedDrink : drink
      ),
    });
  };

  // Remove custom drink
  const removeCustomDrink = (drinkToRemove: CustomDrink) => {
    setState({
      ...state,
      customDrinks: state.customDrinks.filter(drink => drink.id !== drinkToRemove.id),
    });
  };

  // Import data (replacing existing)
  const importData = (data: Partial<AppState>) => {
    setState({
      ...state,
      ...data,
      preferences: {
        ...state.preferences,
        ...(data.preferences || {}),
      },
    });
    setLastIntakeTimestamp(Date.now());
  };

  /**
   * Import data with merge strategy - merges new data with existing data
   * Prevents duplicates by checking IDs
   */
  const importDataWithMerge = (data: { caffeineIntakes?: CaffeineIntake[], customDrinks?: CustomDrink[] }) => {
    const { caffeineIntakes = [], customDrinks = [] } = data;
    
    // Merge caffeine intakes without duplicates (by ID)
    const existingIntakeIds = new Set(state.caffeineIntakes.map(intake => intake.id));
    const newIntakes = caffeineIntakes.filter(intake => !existingIntakeIds.has(intake.id));
    
    // Merge custom drinks without duplicates (by ID)
    const existingDrinkIds = new Set(state.customDrinks.map(drink => drink.id));
    const newDrinks = customDrinks.filter(drink => !existingDrinkIds.has(drink.id));
    
    setState({
      ...state,
      caffeineIntakes: [...state.caffeineIntakes, ...newIntakes],
      customDrinks: [...state.customDrinks, ...newDrinks]
    });
    
    setLastIntakeTimestamp(Date.now());
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
  
  /**
   * Reset all user data but preserve preferences
   */
  const resetAllData = () => {
    setState({
      caffeineIntakes: [],
      customDrinks: [],
      preferences: state.preferences, // Preserve preferences
    });
    setLastIntakeTimestamp(Date.now());
  };

  const value = {
    state,
    lastIntakeTimestamp, // Expose the timestamp to components
    addCaffeineIntake,
    updateCaffeineIntake,
    removeCaffeineIntake,
    clearAllIntakes,
    addCustomDrink,
    updateCustomDrink,
    removeCustomDrink,
    importData,
    importDataWithMerge,
    exportData,
    updatePreferences,
    resetPreferences,
    resetAllData,
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