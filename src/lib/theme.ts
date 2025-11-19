// Theme system for Blackjack game

export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Table colors
  tableFelt: string;
  tableBorder: string;
  tableBackground: string;

  // Card colors
  cardBackground: string;
  cardBorder: string;
  cardText: string;
  cardShadow: string;

  // UI colors
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export const LIGHT_THEME: ThemeColors = {
  // Table
  tableFelt: '#059669', // green-600
  tableBorder: '#047857', // green-700
  tableBackground: '#f0fdf4', // green-50

  // Cards
  cardBackground: '#ffffff',
  cardBorder: '#d1d5db', // gray-300
  cardText: '#111827', // gray-900
  cardShadow: 'rgba(0, 0, 0, 0.1)',

  // UI
  background: '#f9fafb', // gray-50
  surface: '#ffffff',
  primary: '#3b82f6', // blue-500
  secondary: '#6b7280', // gray-500
  accent: '#8b5cf6', // violet-500
  text: '#111827', // gray-900
  textSecondary: '#6b7280', // gray-500
  border: '#e5e7eb', // gray-200
  success: '#10b981', // green-500
  warning: '#f59e0b', // amber-500
  error: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
};

export const DARK_THEME: ThemeColors = {
  // Table
  tableFelt: '#065f46', // green-800
  tableBorder: '#064e3b', // green-900
  tableBackground: '#1f2937', // gray-800

  // Cards
  cardBackground: '#f9fafb', // gray-50 (cards stay light)
  cardBorder: '#d1d5db', // gray-300
  cardText: '#111827', // gray-900
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  // UI
  background: '#111827', // gray-900
  surface: '#1f2937', // gray-800
  primary: '#60a5fa', // blue-400
  secondary: '#9ca3af', // gray-400
  accent: '#a78bfa', // violet-400
  text: '#f9fafb', // gray-50
  textSecondary: '#d1d5db', // gray-300
  border: '#374151', // gray-700
  success: '#34d399', // green-400
  warning: '#fbbf24', // amber-400
  error: '#f87171', // red-400
  info: '#60a5fa', // blue-400
};

/**
 * Get theme colors
 */
export function getThemeColors(theme: Theme): ThemeColors {
  return theme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  const colors = getThemeColors(theme);
  const root = document.documentElement;

  // Apply CSS custom properties
  root.style.setProperty('--color-table-felt', colors.tableFelt);
  root.style.setProperty('--color-table-border', colors.tableBorder);
  root.style.setProperty('--color-table-bg', colors.tableBackground);
  root.style.setProperty('--color-card-bg', colors.cardBackground);
  root.style.setProperty('--color-card-border', colors.cardBorder);
  root.style.setProperty('--color-card-text', colors.cardText);
  root.style.setProperty('--color-card-shadow', colors.cardShadow);
  root.style.setProperty('--color-bg', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-info', colors.info);

  // Update HTML class
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Get theme from localStorage or system preference
 */
export function getInitialTheme(): Theme {
  const saved = localStorage.getItem('blackjack_theme');
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/**
 * Save theme to localStorage
 */
export function saveTheme(theme: Theme): void {
  localStorage.setItem('blackjack_theme', theme);
}

/**
 * Toggle theme
 */
export function toggleTheme(currentTheme: Theme): Theme {
  return currentTheme === 'light' ? 'dark' : 'light';
}
