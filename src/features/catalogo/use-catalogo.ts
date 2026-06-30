import { useQuery } from '@tanstack/react-query';

import { obtenerCategorias, obtenerProductos } from './catalogo.api';

export function useProductos() {
  return useQuery({
    queryKey: ['catalogo', 'productos'],
    queryFn: obtenerProductos,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['catalogo', 'categorias'],
    queryFn: obtenerCategorias,
    staleTime: 5 * 60 * 1000,
  });
}
