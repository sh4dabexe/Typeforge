import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeId, UserPreferences } from '../types';
import { DEFAULT_PREFERENCES, getLocalPreferences, saveLocalPreferences } from '../utils/storage';

interface ThemeContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() => getLocalPreferences());

  useEffect(() => {
    // Apply theme attribute to document element
    document.documentElement.setAttribute('data-theme', preferences.theme);
    
    // Toggle dark class for Tailwind
    if (preferences.theme === 'porcelain') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [preferences.theme]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    const updated = saveLocalPreferences(updates);
    setPreferencesState(updated);
  };

  const setTheme = (theme: ThemeId) => {
    updatePreferences({ theme });
  };

  return (
    <ThemeContext.Provider value={{ preferences, updatePreferences, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
