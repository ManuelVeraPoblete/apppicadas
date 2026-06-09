export const Colors = {
  primary: '#E85D04',
  primaryLight: '#FF7A1A',
  primaryDark: '#C04A00',

  secondary: '#FFF8F0',
  secondaryDark: '#FFE8CC',

  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F5',

  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#ADADAD',
  textInverse: '#FFFFFF',

  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  success: '#2E7D32',
  successLight: '#E8F5E9',
  error: '#C62828',
  errorLight: '#FFEBEE',
  warning: '#E65100',
  warningLight: '#FFF3E0',
  info: '#1565C0',
  infoLight: '#E3F2FD',

  star: '#FFC107',
  overlay: 'rgba(0,0,0,0.5)',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
