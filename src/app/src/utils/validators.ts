/**
 * Validation utilities for Half-Life Caffeine Tracker
 */

import { VolumeUnit } from '../types';

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