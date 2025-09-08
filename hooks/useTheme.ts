import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme(initialTheme: Theme = 'light') {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return initialTheme;
    }
    const storedTheme = window.localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return storedTheme || (prefersDark ? 'dark' : initialTheme);
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme };
}