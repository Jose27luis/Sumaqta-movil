import { useMutation, useQuery } from '@tanstack/react-query';

import { env } from '@/core/config/env';
import { buscarClientes, cobrarMesa, obtenerCuentaMesa, obtenerMediosPago } from './cobro.api';
import { ResultadoCobro, TipoComprobante } from './cobro.types';

const TIPO_DOCUMENTO: Record<TipoComprobante, string> = {
  boleta: '03',
  factura: '01',
  nota: '80',
};

export function useMediosPago() {
  return useQuery({
    queryKey: ['cobro', 'medios-pago'],
    queryFn: obtenerMediosPago,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCuentaMesa(mesaId: string) {
  return useQuery({
    queryKey: ['cobro', 'cuenta', mesaId],
    queryFn: () => obtenerCuentaMesa(Number(mesaId)),
    enabled: mesaId !== '',
  });
}

export function useClientes(input: string) {
  const limpio = input.trim();
  return useQuery({
    queryKey: ['cobro', 'clientes', limpio],
    queryFn: () => buscarClientes(limpio),
    enabled: limpio.length >= 3,
  });
}

export interface CobrarInput {
  mesaId: string;
  tipo: TipoComprobante;
  medioPagoId: string;
  clienteId: number | null;
  items: { itemId: number; cantidad: number }[];
}

async function cobrar(input: CobrarInput): Promise<ResultadoCobro> {
  if (!env.cobroHabilitado) {
    return { estado: 'deshabilitado' };
  }
  await cobrarMesa({
    mesaId: Number(input.mesaId),
    documentTypeId: TIPO_DOCUMENTO[input.tipo],
    clienteId: input.clienteId,
    medioPagoId: input.medioPagoId,
    items: input.items,
  });
  return { estado: 'cobrada' };
}

export function useCobrar() {
  return useMutation({ mutationFn: cobrar });
}
