export type EstadoMesa = 'libre' | 'ocupada' | 'porCobrar';

export interface Mesa {
  id: number;
  nombre: string;
  ambiente: string;
  estado: EstadoMesa;
  total: number;
  personas: number;
  mozo: string;
  comandas: number;
  abiertaDesde: string;
  grupoId: number | null;
  esPrincipal: boolean;
}

export interface Ambiente {
  nombre: string;
  activo: boolean;
  cantidadMesas: number;
  esDelivery: boolean;
  esTakeaway: boolean;
}

export interface Salon {
  ambientes: Ambiente[];
  mesas: Mesa[];
}
