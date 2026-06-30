import { create } from 'zustand';

import { Producto } from '@/features/catalogo/catalogo.types';

export interface ItemPedido {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  nota: string;
}

interface BagState {
  porMesa: Record<string, ItemPedido[]>;
  agregar: (mesaId: string, producto: Producto) => void;
  incrementar: (mesaId: string, id: number) => void;
  decrementar: (mesaId: string, id: number) => void;
  quitar: (mesaId: string, id: number) => void;
  setNota: (mesaId: string, id: number, nota: string) => void;
  limpiar: (mesaId: string) => void;
}

function actualizar(
  estado: Record<string, ItemPedido[]>,
  mesaId: string,
  fn: (items: ItemPedido[]) => ItemPedido[]
): Record<string, ItemPedido[]> {
  const items = estado[mesaId] ?? [];
  return { ...estado, [mesaId]: fn(items) };
}

export const useBag = create<BagState>((set) => ({
  porMesa: {},

  agregar: (mesaId, producto) =>
    set((s) => ({
      porMesa: actualizar(s.porMesa, mesaId, (items) => {
        const existente = items.find((i) => i.id === producto.id);
        if (existente) {
          return items.map((i) =>
            i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
          );
        }
        return [
          ...items,
          { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1, nota: '' },
        ];
      }),
    })),

  incrementar: (mesaId, id) =>
    set((s) => ({
      porMesa: actualizar(s.porMesa, mesaId, (items) =>
        items.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i))
      ),
    })),

  decrementar: (mesaId, id) =>
    set((s) => ({
      porMesa: actualizar(s.porMesa, mesaId, (items) =>
        items
          .map((i) => (i.id === id ? { ...i, cantidad: i.cantidad - 1 } : i))
          .filter((i) => i.cantidad > 0)
      ),
    })),

  quitar: (mesaId, id) =>
    set((s) => ({
      porMesa: actualizar(s.porMesa, mesaId, (items) => items.filter((i) => i.id !== id)),
    })),

  setNota: (mesaId, id, nota) =>
    set((s) => ({
      porMesa: actualizar(s.porMesa, mesaId, (items) =>
        items.map((i) => (i.id === id ? { ...i, nota } : i))
      ),
    })),

  limpiar: (mesaId) =>
    set((s) => ({ porMesa: { ...s.porMesa, [mesaId]: [] } })),
}));

export function totalItems(items: ItemPedido[]): number {
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}

export function totalImporte(items: ItemPedido[]): number {
  return items.reduce((acc, i) => acc + i.cantidad * i.precio, 0);
}
