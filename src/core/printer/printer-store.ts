import { create } from 'zustand';

import { secureStorage } from '@/core/storage/secure-storage';

const CLAVE = 'sq-printer';

export interface Impresora {
  nombre: string;
  direccion: string;
}

interface Persistido {
  impresoras: Impresora[];
  activa: string | null;
  autoImprimir: boolean;
}

interface PrinterState extends Persistido {
  hidratado: boolean;
  hidratar: () => Promise<void>;
  guardar: (imp: Impresora) => Promise<void>;
  quitar: (direccion: string) => Promise<void>;
  setAuto: (valor: boolean) => Promise<void>;
}

async function persistir(estado: Persistido): Promise<void> {
  await secureStorage.set(CLAVE, JSON.stringify(estado));
}

export const usePrinter = create<PrinterState>((set, get) => ({
  impresoras: [],
  activa: null,
  autoImprimir: true,
  hidratado: false,

  hidratar: async () => {
    const crudo = await secureStorage.get(CLAVE);
    if (crudo) {
      try {
        const d = JSON.parse(crudo) as Persistido;
        set({
          impresoras: Array.isArray(d.impresoras) ? d.impresoras : [],
          activa: d.activa ?? null,
          autoImprimir: d.autoImprimir ?? true,
          hidratado: true,
        });
        return;
      } catch {
        // configuración corrupta, se reinicia
      }
    }
    set({ hidratado: true });
  },

  guardar: async (imp) => {
    const previas = get().impresoras.filter((i) => i.direccion !== imp.direccion);
    const impresoras = [...previas, imp];
    set({ impresoras, activa: imp.direccion });
    await persistir({ impresoras, activa: imp.direccion, autoImprimir: get().autoImprimir });
  },

  quitar: async (direccion) => {
    const impresoras = get().impresoras.filter((i) => i.direccion !== direccion);
    const activa = get().activa === direccion ? null : get().activa;
    set({ impresoras, activa });
    await persistir({ impresoras, activa, autoImprimir: get().autoImprimir });
  },

  setAuto: async (valor) => {
    set({ autoImprimir: valor });
    await persistir({ impresoras: get().impresoras, activa: get().activa, autoImprimir: valor });
  },
}));
