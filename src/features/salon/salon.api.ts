import { api } from '@/core/api/client';
import { Ambiente, EstadoMesa, Mesa, Salon } from './salon.types';

type Fila = Record<string, unknown>;

function numero(fila: Fila, clave: string): number {
  const valor = fila[clave];
  if (typeof valor === 'number') {
    return valor;
  }
  if (typeof valor === 'string' && valor.trim() !== '' && !Number.isNaN(Number(valor))) {
    return Number(valor);
  }
  return 0;
}

function texto(fila: Fila, clave: string): string {
  const valor = fila[clave];
  return typeof valor === 'string' ? valor : valor == null ? '' : String(valor);
}

function bandera(fila: Fila, clave: string): boolean {
  return fila[clave] === true || fila[clave] === 1 || fila[clave] === '1';
}

function longitud(fila: Fila, clave: string): number {
  const valor = fila[clave];
  return Array.isArray(valor) ? valor.length : 0;
}

function resolverEstado(fila: Fila): EstadoMesa {
  const bruto = texto(fila, 'status').toLowerCase();
  const orden = texto(fila, 'order_status').toLowerCase();
  if (orden.includes('pag') || orden.includes('cobr') || bandera(fila, 'close')) {
    return 'porCobrar';
  }
  const ocupada =
    numero(fila, 'total') > 0 ||
    numero(fila, 'quantityOrders') > 0 ||
    longitud(fila, 'products') > 0 ||
    bandera(fila, 'open') ||
    bruto.includes('ocup') ||
    bruto.includes('busy') ||
    bruto.includes('occupied');
  return ocupada ? 'ocupada' : 'libre';
}

function mapMesa(fila: Fila): Mesa {
  const grupo = fila['group_id'];
  return {
    id: numero(fila, 'id'),
    nombre: texto(fila, 'label'),
    ambiente: texto(fila, 'environment'),
    estado: resolverEstado(fila),
    total: numero(fila, 'total'),
    personas: numero(fila, 'personas'),
    mozo: texto(fila, 'waiter'),
    comandas: numero(fila, 'quantityOrders'),
    abiertaDesde: texto(fila, 'timeOpening'),
    grupoId: typeof grupo === 'number' ? grupo : null,
    esPrincipal: bandera(fila, 'is_main_table'),
  };
}

function mapAmbiente(fila: Fila): Ambiente {
  return {
    nombre: texto(fila, 'name'),
    activo: bandera(fila, 'active'),
    cantidadMesas: numero(fila, 'tablesQuantity'),
    esDelivery: bandera(fila, 'is_delivery'),
    esTakeaway: bandera(fila, 'is_takeaway'),
  };
}

interface SalonResponse {
  environments?: unknown[];
  tables?: unknown[];
}

function soloFilas(lista: unknown): Fila[] {
  return (Array.isArray(lista) ? lista : []).filter(
    (f): f is Fila => typeof f === 'object' && f !== null
  );
}

export async function obtenerSalon(): Promise<Salon> {
  const { data } = await api.get<SalonResponse>('/restaurant/tablesAndEnv');
  return {
    ambientes: soloFilas(data.environments).map(mapAmbiente),
    mesas: soloFilas(data.tables).map(mapMesa),
  };
}
