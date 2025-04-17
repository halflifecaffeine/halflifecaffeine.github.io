/**
 * Validation utilities for Half-Life Caffeine Tracker
 */

import { VolumeUnit, CaffeineIntake, Drink, UserPreferences } from '../types';

/**
 * Check if a string is a valid time in HH:MM format
 * @param timeString String to validate as time
 * @returns Boolean indicating if the string is a valid time
 */
export const isValidTimeFormat = (timeString: string): boolean => {
  // Regular expression for HH:MM format (24-hour)
  const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return timeRegex.test(timeString);
};

/**
 * Check if a string is a valid number
 * @param numString String to validate as number
 * @returns Boolean indicating if the string is a valid number
 */
export const isValidNumber = (numString: string): boolean => {
  return !isNaN(parseFloat(numString)) && isFinite(Number(numString)) && Number(numString) >= 0;
};

/**
 * Check if a string is a valid decimal number with up to 2 decimal places
 * @param numString String to validate as decimal number
 * @returns Boolean indicating if the string is a valid decimal number
 */
export const isValidDecimalNumber = (numString: string): boolean => {
  const decimalRegex = /^\d+(\.\d{1,2})?$/;
  return decimalRegex.test(numString) && Number(numString) >= 0;
};

/**
 * Validate an intake text entry line (HH:MM <amount in mg>)
 * @param line Line of text to validate
 * @returns Object with validation result and error message
 */
export const validateIntakeTextLine = (line: string): { isValid: boolean; error?: string } => {
  if (!line.trim()) {
    return { isValid: true }; // Empty line is valid
  }
  
  const parts = line.trim().split(/\s+/);
  
  if (parts.length !== 2) {
    return { 
      isValid: false, 
      error: 'Invalid format. Expected "HH:MM <amount in mg>".'
    };
  }
  
  const [time, amount] = parts;
  
  if (!isValidTimeFormat(time)) {
    return { 
      isValid: false, 
      error: `Invalid time format "${time}". Expected HH:MM (24-hour format).`
    };
  }
  
  if (!isValidNumber(amount)) {
    return { 
      isValid: false, 
      error: `Invalid caffeine amount "${amount}". Must be a positive number.`
    };
  }
  
  return { isValid: true };
};

/**
 * Validate volume input
 * @param volume Volume value
 * @param unit Volume unit
 * @returns Object with validation result and error message
 */
export const validateVolumeInput = (
  volume: string | number,
  unit: VolumeUnit
): { isValid: boolean; error?: string } => {
  const volumeValue = typeof volume === 'string' ? volume : volume.toString();
  
  if (!isValidDecimalNumber(volumeValue)) {
    return { 
      isValid: false, 
      error: 'Volume must be a positive number with up to 2 decimal places.'
    };
  }
  
  const numValue = parseFloat(volumeValue);
  if (numValue <= 0) {
    return { 
      isValid: false, 
      error: 'Volume must be greater than zero.'
    };
  }
  
  // Additional validation based on unit type could be added here
  // For example, reasonable max values for different units
  switch(unit) {
    case 'gallon':
      if (numValue > 2) {
        return { 
          isValid: false, 
          error: 'Volume seems unreasonably high for gallons.'
        };
      }
      break;
    case 'quart':
      if (numValue > 8) {
        return { 
          isValid: false, 
          error: 'Volume seems unreasonably high for quarts.'
        };
      }
      break;
    // Additional cases could be added for other units
  }
  
  return { isValid: true };
};

/**
 * Validate a datetime string
 * @param datetimeString Datetime string to validate
 * @returns Boolean indicating if the string is a valid datetime
 */
export const isValidDatetime = (datetimeString: string): boolean => {
  const date = new Date(datetimeString);
  return !isNaN(date.getTime());
};

/**
 * Validate user preferences data
 * @param preferences The preferences object to validate
 * @returns Object with validation result and error message
 */
export const validatePreferencesData = (preferences: any): { isValid: boolean; error?: string } => {
  if (!preferences || typeof preferences !== 'object') {
    return {
      isValid: false,
      error: 'Invalid preferences format: Expected an object'
    };
  }

  // Validate theme
  if ('theme' in preferences) {
    const validThemes = ['auto', 'light', 'dark'];
    if (!validThemes.includes(preferences.theme)) {
      return {
        isValid: false,
        error: `Invalid theme: "${preferences.theme}". Expected one of: ${validThemes.join(', ')}`
      };
    }
  }

  // Validate halfLifeHours
  if ('halfLifeHours' in preferences) {
    if (typeof preferences.halfLifeHours !== 'number' || 
        preferences.halfLifeHours < 1 || 
        preferences.halfLifeHours > 24) {
      return {
        isValid: false,
        error: 'Invalid halfLifeHours: Expected a number between 1 and 24'
      };
    }
  }

  // Validate maxSafeCaffeineLevel
  if ('maxSafeCaffeineLevel' in preferences) {
    if (typeof preferences.maxSafeCaffeineLevel !== 'number' || 
        preferences.maxSafeCaffeineLevel < 0 || 
        preferences.maxSafeCaffeineLevel > 1000) {
      return {
        isValid: false,
        error: 'Invalid maxSafeCaffeineLevel: Expected a number between 0 and 1000'
      };
    }
  }

  // Validate sleepCaffeineThreshold
  if ('sleepCaffeineThreshold' in preferences) {
    if (typeof preferences.sleepCaffeineThreshold !== 'number' || 
        preferences.sleepCaffeineThreshold < 0 || 
        preferences.sleepCaffeineThreshold > 500) {
      return {
        isValid: false,
        error: 'Invalid sleepCaffeineThreshold: Expected a number between 0 and 500'
      };
    }
  }

  // Validate sleepStartHour
  if ('sleepStartHour' in preferences) {
    if (typeof preferences.sleepStartHour !== 'number' || 
        preferences.sleepStartHour < 0 || 
        preferences.sleepStartHour > 23 ||
        !Number.isInteger(preferences.sleepStartHour)) {
      return {
        isValid: false,
        error: 'Invalid sleepStartHour: Expected an integer between 0 and 23'
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate imported data to ensure it meets the required format
 * @param data The data object to validate
 * @returns Object with validation result and error message
 */
export const validateImportData = (data: any): { isValid: boolean; error?: string } => {
  // Check if the data object exists
  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      error: 'Invalid data format: Expected a JSON object'
    };
  }

  // Check for version information (optional but recommended)
  if (data.version && typeof data.version !== 'string') {
    return {
      isValid: false,
      error: 'Invalid version format: Expected a string'
    };
  }

  // Validate preferences if present
  if ('preferences' in data) {
    const preferencesValidation = validatePreferencesData(data.preferences);
    if (!preferencesValidation.isValid) {
      return preferencesValidation;
    }
  }

  // Validate caffeine intakes if present
  if ('caffeineIntakes' in data) {
    if (!Array.isArray(data.caffeineIntakes)) {
      return {
        isValid: false,
        error: 'Invalid caffeineIntakes format: Expected an array'
      };
    }

    // Validate each intake
    for (let i = 0; i < data.caffeineIntakes.length; i++) {
      const intake = data.caffeineIntakes[i];
      
      // Check for required fields
      if (!intake.id || typeof intake.id !== 'string') {
        return {
          isValid: false,
          error: `Invalid intake at position ${i}: Missing or invalid id`
        };
      }
      
      if (!intake.datetime || !isValidDatetime(intake.datetime)) {
        return {
          isValid: false,
          error: `Invalid intake at position ${i}: Missing or invalid datetime`
        };
      }
      
      if (!intake.drink || typeof intake.drink !== 'object') {
        return {
          isValid: false,
          error: `Invalid intake at position ${i}: Missing or invalid drink`
        };
      }
      
      // Validate the drink object within intake
      const drink = intake.drink;
      if (!drink.brand || typeof drink.brand !== 'string' ||
          !drink.product || typeof drink.product !== 'string' ||
          !drink.category || typeof drink.category !== 'string' ||
          typeof drink.caffeine_mg_per_oz !== 'number' ||
          typeof drink.default_size_in_oz !== 'number') {
        return {
          isValid: false,
          error: `Invalid intake at position ${i}: Drink missing required properties`
        };
      }
      
      // Check volume and unit
      if (typeof intake.volume !== 'number' || intake.volume <= 0) {
        return {
          isValid: false,
          error: `Invalid intake at position ${i}: Missing or invalid volume`
        };
      }
      
      const validUnits: VolumeUnit[] = ['oz', 'ml', 'cup', 'quart', 'gallon'];
      if (!intake.unit || !validUnits.includes(intake.unit as VolumeUnit)) {
        return {
          isValid: false,
          error: `Invalid intake at position ${i}: Missing or invalid unit`
        };
      }
      
      // Check caffeine amount
      if (typeof intake.mg !== 'number' || intake.mg < 0) {
        return {
          isValid: false,
          error: `Invalid intake at position ${i}: Missing or invalid caffeine amount`
        };
      }
      
      // Notes are optional - no validation needed
    }
  }

  // Validate custom drinks if present
  if ('customDrinks' in data) {
    if (!Array.isArray(data.customDrinks)) {
      return {
        isValid: false,
        error: 'Invalid customDrinks format: Expected an array'
      };
    }

    // Validate each custom drink
    for (let i = 0; i < data.customDrinks.length; i++) {
      const drink = data.customDrinks[i];
      
      // Check for required fields
      if (!drink.id || typeof drink.id !== 'string') {
        return {
          isValid: false,
          error: `Invalid custom drink at position ${i}: Missing or invalid id`
        };
      }
      
      if (!drink.brand || typeof drink.brand !== 'string') {
        return {
          isValid: false,
          error: `Invalid custom drink at position ${i}: Missing or invalid brand`
        };
      }
      
      if (!drink.product || typeof drink.product !== 'string') {
        return {
          isValid: false,
          error: `Invalid custom drink at position ${i}: Missing or invalid product`
        };
      }
      
      if (!drink.category || typeof drink.category !== 'string') {
        return {
          isValid: false,
          error: `Invalid custom drink at position ${i}: Missing or invalid category`
        };
      }
      
      if (typeof drink.caffeine_mg_per_oz !== 'number' || drink.caffeine_mg_per_oz < 0) {
        return {
          isValid: false,
          error: `Invalid custom drink at position ${i}: Missing or invalid caffeine_mg_per_oz`
        };
      }
      
      if (typeof drink.default_size_in_oz !== 'number' || drink.default_size_in_oz <= 0) {
        return {
          isValid: false,
          error: `Invalid custom drink at position ${i}: Missing or invalid default_size_in_oz`
        };
      }
      
      // user_entered should be true for custom drinks
      if (drink.user_entered !== true) {
        return {
          isValid: false,
          error: `Invalid custom drink at position ${i}: Missing or invalid user_entered flag`
        };
      }
    }
  }

  return { isValid: true };
};