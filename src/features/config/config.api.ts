import { api } from '@/core/api/client';
import { ConfigRestaurante } from './config.types';

interface ConfigResponse {
  success?: boolean;
  data?: Record<string, unknown>;
}

function flag(data: Record<string, unknown>, clave: string): boolean {
  const valor = data[clave];
  return valor === true || valor === 1 || valor === '1';
}

export async function obtenerConfig(): Promise<ConfigRestaurante> {
  const { data } = await api.get<ConfigResponse>('/restaurant/configurations');
  const d = data.data ?? {};
  return {
    posHabilitado: flag(d, 'enabled_pos_waiter'),
    comandaHabilitada: flag(d, 'enabled_command_waiter'),
    cerrarMesaHabilitado: flag(d, 'enabled_close_table_mozo'),
  };
}
