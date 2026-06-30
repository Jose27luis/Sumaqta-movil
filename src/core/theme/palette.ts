import { Paleta } from './tokens';

export type FuenteId = 'sistema' | 'inter' | 'poppins' | 'mono';

export interface TemaConfig {
  fondo: string;
  principal: string;
  texto: string;
  fuente: FuenteId;
}

export const temaPorDefecto: TemaConfig = {
  fondo: '#F3EEE3',
  principal: '#211D17',
  texto: '#211D17',
  fuente: 'sistema',
};

export const PRESETS: { id: string; nombre: string; config: Omit<TemaConfig, 'fuente'> }[] = [
  { id: 'crema', nombre: 'Crema', config: { fondo: '#F3EEE3', principal: '#211D17', texto: '#211D17' } },
  { id: 'oscuro', nombre: 'Oscuro', config: { fondo: '#16130F', principal: '#E0B25B', texto: '#F3EEE3' } },
  { id: 'azul', nombre: 'Azul', config: { fondo: '#EEF2F8', principal: '#1E4E8C', texto: '#16263B' } },
  { id: 'verde', nombre: 'Verde', config: { fondo: '#EEF4EE', principal: '#1F6B41', texto: '#19281F' } },
  { id: 'vino', nombre: 'Vino', config: { fondo: '#F6EEEE', principal: '#8C2230', texto: '#2B1517' } },
];

export const COLORES_FONDO = ['#F3EEE3', '#FFFFFF', '#16130F', '#EEF2F8', '#EEF4EE', '#F6EEEE', '#1A1A1A'];
export const COLORES_PRINCIPAL = ['#211D17', '#8A5A00', '#1E4E8C', '#1F6B41', '#8C2230', '#5B3FA3', '#E0B25B'];
export const COLORES_TEXTO = ['#211D17', '#16263B', '#F3EEE3', '#19281F', '#1A1A1A'];

function aRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

function aHex(rgb: [number, number, number]): string {
  return '#' + rgb.map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('');
}

function mezcla(a: string, b: string, t: number): string {
  const ra = aRgb(a);
  const rb = aRgb(b);
  return aHex([ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t, ra[2] + (rb[2] - ra[2]) * t]);
}

export function esOscuro(hex: string): boolean {
  const [r, g, b] = aRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export function construirPaleta(config: TemaConfig): Paleta {
  const { fondo, principal, texto } = config;
  const bgOscuro = esOscuro(fondo);
  const blanco = '#FFFFFF';
  const negro = '#000000';

  return {
    bg: fondo,
    surface: bgOscuro ? mezcla(fondo, blanco, 0.08) : blanco,
    surfaceAlt: bgOscuro ? mezcla(fondo, blanco, 0.05) : mezcla(fondo, negro, 0.05),
    border: bgOscuro ? mezcla(fondo, blanco, 0.16) : mezcla(fondo, negro, 0.09),
    text: texto,
    muted: mezcla(texto, fondo, 0.42),
    faint: mezcla(texto, fondo, 0.58),
    brand: principal,
    onBrand: esOscuro(principal) ? '#FFFFFF' : '#211D17',
    accent: principal,
    accentSoft: mezcla(principal, blanco, 0.86),
    accentBorder: mezcla(principal, blanco, 0.7),
    accentText: esOscuro(principal) ? principal : mezcla(principal, negro, 0.2),
    tabBar: bgOscuro ? mezcla(fondo, blanco, 0.06) : mezcla(fondo, blanco, 0.4),
    ok: '#3F7A52',
    warn: '#B5791A',
    danger: '#B23B3B',
  };
}
