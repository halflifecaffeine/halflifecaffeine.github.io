/**
 * Utility functions for unit conversions in the Half-Life Caffeine Tracker
 */

import { VolumeUnit } from '../types';

// Conversion factors to ounces
const CONVERSION_FACTORS: Record<VolumeUnit, number> = {
  oz: 1,          // 1 oz = 1 oz
  ml: 0.033814,   // 1 ml = 0.033814 oz
  cup: 8,         // 1 cup = 8 oz
  quart: 32,      // 1 quart = 32 oz
  gallon: 128     // 1 gallon = 128 oz
};

/**
 * Convert a volume from any unit to ounces
 * @param volume The volume amount
 * @param unit The unit of the volume
 * @returns Volume in ounces
 */
export const convertToOunces = (volume: number, unit: VolumeUnit): number => {
  return volume * CONVERSION_FACTORS[unit];
};

/**
 * Convert a volume from ounces to any unit
 * @param volumeOz Volume in ounces
 * @param targetUnit The unit to convert to
 * @returns Volume in target unit
 */
export const convertFromOunces = (volumeOz: number, targetUnit: VolumeUnit): number => {
  return volumeOz / CONVERSION_FACTORS[targetUnit];
};

/**
 * Calculate caffeine amount based on drink caffeine content and volume
 * @param caffeinePerOz Caffeine per ounce in mg
 * @param volume Volume amount
 * @param unit Unit of the volume
 * @returns Caffeine amount in mg
 */
export const calculateCaffeineAmount = (
  caffeinePerOz: number, 
  volume: number, 
  unit: VolumeUnit
): number => {
  const volumeInOz = convertToOunces(volume, unit);
  return caffeinePerOz * volumeInOz;
};

/**
 * Get caffeine per ounce for a drink
 * @param totalCaffeine Total caffeine in drink in mg
 * @param totalVolume Total volume of the drink
 * @param volumeUnit Unit of the volume
 * @returns Caffeine per ounce in mg
 */
export const getCaffeinePerOunce = (
  totalCaffeine: number,
  totalVolume: number,
  volumeUnit: VolumeUnit
): number => {
  const volumeInOz = convertToOunces(totalVolume, volumeUnit);
  return totalCaffeine / volumeInOz;
};

/**
 * Format volume with unit for display
 * @param volume Volume amount
 * @param unit Unit of the volume
 * @returns Formatted string with volume and unit
 */
export const formatVolume = (volume: number, unit: VolumeUnit): string => {
  return `${volume} ${unit}`;
};

/**
 * Get a list of all supported volume units with labels
 * @returns Array of volume units with labels
 */
export const getVolumeUnits = (): { value: VolumeUnit; label: string }[] => {
  return [
    { value: 'oz', label: 'Fluid Ounces (oz)' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'cup', label: 'Cups' },
    { value: 'quart', label: 'Quarts' },
    { value: 'gallon', label: 'Gallons' }
  ];
};