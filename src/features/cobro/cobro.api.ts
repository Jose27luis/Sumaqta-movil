import { api } from '@/core/api/client';
import { ClienteBusqueda, Cuenta, LineaCuenta, MedioPago } from './cobro.types';

type Fila = Record<string, unknown>;

function numero(fila: Fila, ...claves: string[]): number {
  for (const clave of claves) {
    const valor = fila[clave];
    if (typeof valor === 'number') {
      return valor;
    }
    if (typeof valor === 'string' && valor.trim() !== '' && !Number.isNaN(Number(valor))) {
      return Number(valor);
    }
  }
  return 0;
}

function texto(fila: Fila, ...claves: string[]): string {
  for (const clave of claves) {
    const valor = fila[clave];
    if (typeof valor === 'string' && valor !== '') {
      return valor;
    }
    if (typeof valor === 'number') {
      return String(valor);
    }
  }
  return '';
}

function soloFilas(lista: unknown): Fila[] {
  return (Array.isArray(lista) ? lista : []).filter(
    (f): f is Fila => typeof f === 'object' && f !== null
  );
}

interface ConfigResponse {
  data?: { payment_method_types?: unknown[] };
  success?: boolean;
}

export async function obtenerMediosPago(): Promise<MedioPago[]> {
  const { data } = await api.get<ConfigResponse>('/restaurant/configurations');
  return soloFilas(data.data?.payment_method_types).map((f) => ({
    id: texto(f, 'id'),
    descripcion: texto(f, 'description'),
    esEfectivo: numero(f, 'is_cash') === 1,
    tieneTarjeta: f['has_card'] === true,
  }));
}

interface TableResponse {
  table?: Fila;
}

function mapLinea(fila: Fila): LineaCuenta {
  return {
    id: numero(fila, 'id'),
    nombre: texto(fila, 'name', 'description'),
    precio: numero(fila, 'price'),
    cantidad: numero(fila, 'quantity'),
  };
}

export async function obtenerCuentaMesa(mesaId: number): Promise<Cuenta> {
  const { data } = await api.get<TableResponse>(`/restaurant/table/${mesaId}`);
  const mesa = data.table ?? {};
  const items = soloFilas(mesa['products']).map(mapLinea);
  const total = numero(mesa, 'total') || items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  return { items, total };
}

interface ClientesResponse {
  customers?: unknown[];
  data?: unknown[];
}

export async function buscarClientes(input: string): Promise<ClienteBusqueda[]> {
  const { data } = await api.get<ClientesResponse>('/document/search-customers', {
    params: { input },
  });
  const lista = data.customers ?? data.data;
  return soloFilas(lista).map((f) => ({
    id: numero(f, 'id'),
    nombre: texto(f, 'description', 'name'),
    numero: texto(f, 'number'),
    tipoDocumento: texto(f, 'identity_document_type_id'),
  }));
}

export interface CobrarPayload {
  mesaId: number;
  documentTypeId: string;
  clienteId: number | null;
  medioPagoId: string;
  items: { itemId: number; cantidad: number }[];
}

interface CobrarResponse {
  success?: boolean;
  message?: string;
}

export async function cobrarMesa(payload: CobrarPayload): Promise<void> {
  const { data } = await api.post<CobrarResponse>('/mobile/restaurant/charge', {
    table_id: payload.mesaId,
    document_type_id: payload.documentTypeId,
    customer_id: payload.clienteId,
    payment_method_type_id: payload.medioPagoId,
    items: payload.items.map((i) => ({ item_id: i.itemId, quantity: i.cantidad })),
  });
  if (!data.success) {
    throw new Error(data.message || 'No se pudo emitir el comprobante.');
  }
}
