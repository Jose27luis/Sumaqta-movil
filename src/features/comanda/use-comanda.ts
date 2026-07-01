import { useMutation } from '@tanstack/react-query';

import { env } from '@/core/config/env';
import { useSession } from '@/core/auth/session';
import { usePrinter } from '@/core/printer/printer-store';
import { imprimirComanda, impresionDisponible } from '@/core/printer/printer';
import { emitirMesaAbierta } from '@/core/socket/socket';
import { ItemPedido } from '@/features/pedido/bag-store';
import { guardarItemComanda, obtenerBatch } from './comanda.api';
import { ResultadoComanda } from './comanda.types';

export interface EnviarComandaInput {
  mesaId: string;
  mesaNombre: string;
  mozo: string;
  items: ItemPedido[];
}

function horaActual(): string {
  const ahora = new Date();
  const hh = String(ahora.getHours()).padStart(2, '0');
  const mm = String(ahora.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

async function enviarComanda(input: EnviarComandaInput): Promise<ResultadoComanda> {
  if (!env.comandaHabilitada) {
    return { estado: 'deshabilitada', guardados: 0, fallidos: 0, impreso: false };
  }

  const mesaId = Number(input.mesaId);
  const batch = await obtenerBatch(mesaId);

  let guardados = 0;
  let fallidos = 0;
  for (const item of input.items) {
    try {
      await guardarItemComanda({
        mesaId,
        producto: item.producto,
        cantidad: item.cantidad,
        nota: item.nota,
        batch,
      });
      guardados += 1;
    } catch {
      fallidos += 1;
    }
  }

  if (guardados > 0) {
    const ruc = useSession.getState().usuario?.ruc;
    if (ruc) {
      emitirMesaAbierta(mesaId, ruc);
    }
  }

  let impreso = false;
  const activa = usePrinter.getState().activa;
  if (activa && impresionDisponible()) {
    try {
      await imprimirComanda(activa, {
        mesa: input.mesaNombre,
        mozo: input.mozo,
        hora: horaActual(),
        items: input.items.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, nota: i.nota })),
      });
      impreso = true;
    } catch {
      impreso = false;
    }
  }

  return { estado: 'enviada', guardados, fallidos, impreso };
}

export function useEnviarComanda() {
  return useMutation({ mutationFn: enviarComanda });
}
