import { create } from 'zustand';

import { secureStorage } from '@/core/storage/secure-storage';
import { TemaConfig, temaPorDefecto } from './palette';

const CLAVE = 'mf-tema';

interface TemaState {
  config: TemaConfig;
  hidratado: boolean;
  hidratar: () => Promise<void>;
  actualizar: (parcial: Partial<TemaConfig>) => Promise<void>;
  restaurar: () => Promise<void>;
}

export const useTemaStore = create<TemaState>((set, get) => ({
  config: temaPorDefecto,
  hidratado: false,

  hidratar: async () => {
    const crudo = await secureStorage.get(CLAVE);
    if (crudo) {
      try {
        set({ config: { ...temaPorDefecto, ...JSON.parse(crudo) }, hidratado: true });
        return;
      } catch {
        // configuración corrupta, se usa el tema por defecto
      }
    }
    set({ hidratado: true });
  },

  actualizar: async (parcial) => {
    const config = { ...get().config, ...parcial };
    set({ config });
    await secureStorage.set(CLAVE, JSON.stringify(config));
  },

  restaurar: async () => {
    set({ config: { ...temaPorDefecto } });
    await secureStorage.set(CLAVE, JSON.stringify(temaPorDefecto));
  },
}));
