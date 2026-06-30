import { api } from '@/core/api/client';
import { Producto } from '@/features/catalogo/catalogo.types';
import { Batch } from './comanda.types';

interface BatchResponse {
  success?: boolean;
  command_batch_id?: string;
  table_session_id?: string;
}

export async function obtenerBatch(mesaId: number): Promise<Batch> {
  const { data } = await api.get<BatchResponse>('/restaurant/command-item/next-id', {
    params: { table_id: mesaId },
  });
  return {
    commandBatchId: data.command_batch_id ?? null,
    tableSessionId: data.table_session_id ?? null,
  };
}

export interface ItemComandaPayload {
  mesaId: number;
  producto: Producto;
  cantidad: number;
  nota: string;
  batch: Batch;
}

interface GuardarResponse {
  success?: boolean;
  id?: number;
}

export async function guardarItemComanda(payload: ItemComandaPayload): Promise<number | null> {
  const { data } = await api.post<GuardarResponse>('/restaurant/command-item/save', {
    table_id: payload.mesaId,
    item_id: payload.producto.id,
    item: payload.producto,
    quantity: payload.cantidad,
    note: payload.nota,
    status: 1,
    status_description: 'RECIBIDO',
    command_batch_id: payload.batch.commandBatchId,
    table_session_id: payload.batch.tableSessionId,
  });
  if (!data.success) {
    throw new Error('No se pudo guardar el ítem de la comanda.');
  }
  return data.id ?? null;
}
