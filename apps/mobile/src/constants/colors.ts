export const COLORS = {
  primary: '#1E3A8A',
  primaryLight: '#3B5FC7',
  secondary: '#10B981',
  accent: '#F59E0B',
  bg: '#F9FAFB',
  card: '#FFFFFF',
  text: '#111827',
  textLight: '#6B7280',
  border: '#E5E7EB',
  danger: '#EF4444',
} as const;

export type ColorKey = keyof typeof COLORS;
