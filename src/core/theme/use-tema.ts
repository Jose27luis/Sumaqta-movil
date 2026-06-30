import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Paleta } from './tokens';
import { construirPaleta, FuenteId } from './palette';
import { useTemaStore } from './tema-store';

const SANS: Record<FuenteId, string | undefined> = {
  sistema: undefined,
  inter: 'Inter_500Medium',
  poppins: 'Poppins_500Medium',
  mono: 'IBMPlexMono_500Medium',
};

const SANS_BOLD: Record<FuenteId, string | undefined> = {
  sistema: undefined,
  inter: 'Inter_700Bold',
  poppins: 'Poppins_700Bold',
  mono: 'IBMPlexMono_600SemiBold',
};

export interface Tema extends Paleta {
  sans: string | undefined;
  sansBold: string | undefined;
  mono: string;
  monoSemi: string;
}

export function useTema(): Tema {
  const config = useTemaStore((s) => s.config);
  return useMemo(() => {
    const paleta = construirPaleta(config);
    return {
      ...paleta,
      sans: SANS[config.fuente],
      sansBold: SANS_BOLD[config.fuente],
      mono: 'IBMPlexMono_500Medium',
      monoSemi: 'IBMPlexMono_600SemiBold',
    };
  }, [config]);
}

export function useEstilos<T extends StyleSheet.NamedStyles<T>>(factory: (t: Tema) => T): T {
  const tema = useTema();
  return useMemo(() => factory(tema), [tema]);
}
