export type ThemeMode = 'dark' | 'light';

export const darkTheme = {
  background: '#0E0E14',
  panel: '#151520',
  panelAlt: '#181818',
  textPrimary: '#F5F5FA',
  textSecondary: '#B5B5C5',
  accent: '#E91E63',
  accentAlt: '#FF4D8D',
};

export const lightTheme = {
  background: '#F5F5FA',
  panel: '#FFFFFF',
  panelAlt: '#EAEAF0',
  textPrimary: '#1A1A1A',
  textSecondary: '#555555',
  accent: '#E91E63',
  accentAlt: '#FF4D8D',
};

// Legacy export for backward compatibility
export const theme = darkTheme;

