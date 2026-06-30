import { useMutation, useQuery } from '@tanstack/react-query';

import { env } from '@/core/config/env';
import { buscarClientes, cerrarMesa, obtenerCuentaMesa, obtenerMediosPago } from './cobro.api';
import { ResultadoCobro, TipoComprobante } from './cobro.types';

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
}

async function cobrar(input: CobrarInput): Promise<ResultadoCobro> {
  if (!env.cobroHabilitado) {
    return { estado: 'deshabilitado' };
  }
  await cerrarMesa(Number(input.mesaId));
  return { estado: 'cobrada' };
}

export function useCobrar() {
  return useMutation({ mutationFn: cobrar });
}
