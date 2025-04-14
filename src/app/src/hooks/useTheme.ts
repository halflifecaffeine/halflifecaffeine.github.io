/**
 * Custom hook for managing theme (light/dark)
 */

import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

type Theme = 'light' | 'dark';
type ThemePreference = 'auto' | Theme;

export function useTheme(): [Theme, (preference: ThemePreference) => void] {
  // Store user preference in localStorage
  const [preference, setPreference] = useLocalStorage<ThemePreference>('theme-preference', 'auto');
  
  // Actual theme to use based on preference and system setting
  const [actualTheme, setActualTheme] = useState<Theme>('light');

  // Update theme based on preference and system dark mode
  useEffect(() => {
    const updateTheme = () => {
      if (preference === 'auto') {
        // Use system preference
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setActualTheme(isDarkMode ? 'dark' : 'light');
      } else {
        // Use explicit user preference
        setActualTheme(preference);
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preference === 'auto') {
        updateTheme();
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [preference]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', actualTheme);
    document.body.className = `theme-${actualTheme}`;
  }, [actualTheme]);

  return [actualTheme, setPreference];
}