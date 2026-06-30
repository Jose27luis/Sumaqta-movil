export interface Paleta {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  muted: string;
  faint: string;
  brand: string;
  onBrand: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accentText: string;
  tabBar: string;
  ok: string;
  warn: string;
  danger: string;
}

export const paletaClara: Paleta = {
  bg: '#F3EEE3',
  surface: '#FFFFFF',
  surfaceAlt: '#EFE9DC',
  border: '#E6DFD1',
  text: '#211D17',
  muted: '#8A8273',
  faint: '#A89F8F',
  brand: '#211D17',
  onBrand: '#F3EEE3',
  accent: '#8A5A00',
  accentSoft: '#F6EDD8',
  accentBorder: '#E8D9B0',
  accentText: '#7A4E00',
  tabBar: '#FBF8F1',
  ok: '#3F7A52',
  warn: '#B5791A',
  danger: '#B23B3B',
};

export const paletaOscura: Paleta = {
  bg: '#1A1712',
  surface: '#221E18',
  surfaceAlt: '#2A251E',
  border: '#39342B',
  text: '#F3EEE3',
  muted: '#A89F8F',
  faint: '#7A7163',
  brand: '#F3EEE3',
  onBrand: '#1A1712',
  accent: '#D69A3C',
  accentSoft: '#2A251E',
  accentBorder: '#39342B',
  accentText: '#D69A3C',
  tabBar: '#221E18',
  ok: '#5FA877',
  warn: '#E0A93C',
  danger: '#D96C6C',
};

export const fuentes = {
  mono: 'IBMPlexMono_500Medium',
  monoSemi: 'IBMPlexMono_600SemiBold',
  monoReg: 'IBMPlexMono_400Regular',
};

export const radios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
};

export const espacios = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
