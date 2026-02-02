/**
 * Date Utility Functions
 * 
 * This file contains utility functions for handling dates in a consistent manner
 * throughout the application. All functions work with local time (not UTC) to ensure
 * a consistent user experience.
 */

/**
 * Formats a date string for display with a consistent format
 * @param isoString ISO date string to format
 * @returns Formatted date string in local time
 */
export const formatDisplayDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Converts a Date object to a string format suitable for datetime-local input fields
 * Uses local time (not UTC) to ensure users see their own timezone
 * @param date Date object to format
 * @returns Formatted string in YYYY-MM-DDThh:mm format suitable for datetime-local input
 */
export const formatDateTimeForInput = (date: Date): string => {
  // Format in YYYY-MM-DDThh:mm format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Gets the current date and time as a string formatted for datetime-local input fields
 * @returns Current date/time formatted for datetime-local input
 */
export const getCurrentDateTimeForInput = (): string => {
  return formatDateTimeForInput(new Date());
};

/**
 * Parses a date string from a datetime-local input and returns an ISO string
 * Preserves the user's local timezone information while creating a standard
 * ISO format for storage
 * @param dateTimeString String from datetime-local input
 * @returns ISO format date string that preserves local timezone information
 */
export const parseInputToISOString = (dateTimeString: string): string => {
  // Create a new Date object from the input - this will interpret it in local time
  const date = new Date(dateTimeString);
  return date.toISOString();
};