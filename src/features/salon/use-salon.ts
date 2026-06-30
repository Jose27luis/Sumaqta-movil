import { useQuery } from '@tanstack/react-query';

import { obtenerSalon } from './salon.api';

export function useSalon() {
  return useQuery({
    queryKey: ['salon'],
    queryFn: obtenerSalon,
    refetchInterval: 15000,
  });
}
