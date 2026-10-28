import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeType } from '../types/calculator';

export interface ThemeOption {
  id: ThemeType;
  label: string;
  tagline: string;
  previewColor: string;
  bgHex: string;
}

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  availableThemes: ThemeOption[];
}

export const THEMES: ThemeOption[] = [
  {
    id: 'modern-dark',
    label: 'Obsidian Titanium',
    tagline: 'Precision dark instrument with aerospace amber accents',
    previewColor: '#f59e0b',
    bgHex: '#0b0e14',
  },
  {
    id: 'clean-light',
    label: 'Braun ET66 / Bauhaus',
    tagline: 'Dieter Rams tribute: warm bone chassis, charcoal & orange keys',
    previewColor: '#ea580c',
    bgHex: '#ece6dc',
  },
  {
    id: 'cyberpunk-neon',
    label: 'Tokyo VFD 1984',
    tagline: 'Retro-future phosphor emerald CRT & oscilloscope terminal',
    previewColor: '#10b981',
    bgHex: '#060b09',
  },
  {
    id: 'oled-black',
    label: 'Nordic Monolith',
    tagline: 'Scandinavian dark precision with arctic ice accents',
    previewColor: '#38bdf8',
    bgHex: '#000000',
  },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('omni_calc_theme') as ThemeType;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return 'modern-dark';
  });

  useEffect(() => {
    localStorage.setItem('omni_calc_theme', theme);
    const root = document.documentElement;
    root.classList.remove('theme-modern-dark', 'theme-clean-light', 'theme-cyberpunk-neon', 'theme-oled-black', 'dark');

    root.classList.add(`theme-${theme}`);
    if (theme !== 'clean-light') {
      root.classList.add('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
