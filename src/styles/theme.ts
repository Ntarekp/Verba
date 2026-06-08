export const spacing = {
  unit: 8,
  containerPadding: 24,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  gutter: 16,
};

export const rounded = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export type ThemeColors = {
  surface: string;
  surfaceDim: string;
  surfaceBright: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surfaceVariant: string;
  tertiaryFixed: string;
  tertiaryFixedDim: string;
  primaryFixedDim: string;
  onPrimaryFixed: string;
  secondaryFixed: string;
  secondaryFixedDim: string;
  onSecondaryFixed: string;
};

export const classicThemeColors: ThemeColors = {
  surface: '#f8f9ff',
  surfaceDim: '#cbdbf5',
  surfaceBright: '#f8f9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#e5eeff',
  surfaceContainerHigh: '#dce9ff',
  surfaceContainerHighest: '#d3e4fe',
  onSurface: '#0b1c30',
  onSurfaceVariant: '#464555',
  outline: '#777587',
  outlineVariant: '#c7c4d8',
  primary: '#3525cd',
  onPrimary: '#ffffff',
  primaryContainer: '#4f46e5',
  onPrimaryContainer: '#dad7ff',
  secondary: '#0058be',
  onSecondary: '#ffffff',
  secondaryContainer: '#2170e4',
  onSecondaryContainer: '#fefcff',
  tertiary: '#00505f',
  onTertiary: '#ffffff',
  tertiaryContainer: '#006a7c',
  onTertiaryContainer: '#93e8ff',
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
  background: '#f8f9ff',
  onBackground: '#0b1c30',
  surfaceVariant: '#d3e4fe',
  tertiaryFixed: '#acedff',
  tertiaryFixedDim: '#4cd7f6',
  primaryFixedDim: '#c3c0ff',
  onPrimaryFixed: '#0f0069',
  secondaryFixed: '#d8e2ff',
  secondaryFixedDim: '#adc6ff',
  onSecondaryFixed: '#001a42',
};

// Royal Theme (Sleek deep navy look-and-feel)
export const royalThemeColors: ThemeColors = {
  ...classicThemeColors,
  primary: '#0b1c30',
  primaryContainer: '#213145',
  onPrimaryContainer: '#eaf1ff',
  surfaceContainerLow: '#eff4ff',
  surfaceContainer: '#dce9ff',
};

// Midnight Theme (Premium technical dark mode)
export const midnightThemeColors: ThemeColors = {
  surface: '#0f172a',
  surfaceDim: '#020617',
  surfaceBright: '#1e293b',
  surfaceContainerLowest: '#020617',
  surfaceContainerLow: '#0f172a',
  surfaceContainer: '#1e293b',
  surfaceContainerHigh: '#334155',
  surfaceContainerHighest: '#475569',
  onSurface: '#f8fafc',
  onSurfaceVariant: '#94a3b8',
  outline: '#64748b',
  outlineVariant: '#475569',
  primary: '#4f46e5',
  onPrimary: '#ffffff',
  primaryContainer: '#3730a3',
  onPrimaryContainer: '#e0e7ff',
  secondary: '#3b82f6',
  onSecondary: '#ffffff',
  secondaryContainer: '#1d4ed8',
  onSecondaryContainer: '#eff6ff',
  tertiary: '#06b6d4',
  onTertiary: '#0f172a',
  tertiaryContainer: '#0e7490',
  onTertiaryContainer: '#ecfeff',
  error: '#f43f5e',
  onError: '#ffffff',
  errorContainer: '#881337',
  onErrorContainer: '#ffe4e6',
  background: '#020617',
  onBackground: '#f8fafc',
  surfaceVariant: '#1e293b',
  tertiaryFixed: '#cffafe',
  tertiaryFixedDim: '#22d3ee',
  primaryFixedDim: '#818cf8',
  onPrimaryFixed: '#e0e7ff',
  secondaryFixed: '#dbeafe',
  secondaryFixedDim: '#60a5fa',
  onSecondaryFixed: '#dbeafe',
};

export type FontStyles = {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  lineHeight?: number;
  letterSpacing?: number;
};

export const typography = {
  displayWord: {
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: '700' as const,
    lineHeight: 56,
    letterSpacing: -0.96,
  },
  displayWordMobile: {
    fontFamily: 'Inter',
    fontSize: 40,
    fontWeight: '700' as const,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  sectionHeading: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: -0.28,
  },
  definitionBody: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  labelCaps: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  caption: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
};
