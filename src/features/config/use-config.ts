import { useQuery } from '@tanstack/react-query';

import { obtenerConfig } from './config.api';

export function useConfigRestaurante() {
  return useQuery({
    queryKey: ['config-restaurante'],
    queryFn: obtenerConfig,
    staleTime: 5 * 60 * 1000,
  });
}
