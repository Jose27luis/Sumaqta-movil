import axios from 'axios';

import { env } from '@/core/config/env';
import { resolverBaseUrl } from '@/core/api/client';
import { Usuario } from '@/core/auth/session';

interface CompanyResponse {
  url_logo?: string;
  logo_base64?: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  name?: string;
  email?: string;
  ruc?: string;
  restaurant_role_code?: string;
  establishment_id?: number;
  company?: CompanyResponse;
  message?: string;
}

export interface ResultadoLogin {
  token: string;
  usuario: Usuario;
}

export interface Mozo {
  nombre: string;
  email: string;
}

interface MozosResponse {
  success?: boolean;
  data?: { name?: string; email?: string }[];
}

export async function listarMozos(tenant: string): Promise<Mozo[]> {
  const baseUrl = resolverBaseUrl(tenant);
  const { data } = await axios.get<MozosResponse>(`${baseUrl}/restaurant/list-waiter`, {
    timeout: env.requestTimeout,
  });
  const lista = Array.isArray(data.data) ? data.data : [];
  return lista
    .filter((m) => typeof m.email === 'string' && m.email !== '')
    .map((m) => ({ nombre: m.name ?? '', email: m.email ?? '' }));
}

export async function login(
  tenant: string,
  email: string,
  password: string
): Promise<ResultadoLogin> {
  const baseUrl = resolverBaseUrl(tenant);
  let data: LoginResponse;
  try {
    const respuesta = await axios.post<LoginResponse>(
      `${baseUrl}/login`,
      { email, password },
      { timeout: env.requestTimeout }
    );
    data = respuesta.data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      throw new Error(`El restaurante respondió con un error (${e.response.status}).`);
    }
    throw new Error('Sin conexión con el restaurante. Revisa tu internet.');
  }
  if (!data.success || !data.token) {
    throw new Error(data.message ?? 'PIN incorrecto.');
  }
  return {
    token: data.token,
    usuario: {
      nombre: data.name ?? '',
      email: data.email ?? email,
      ruc: data.ruc ?? '',
      rol: data.restaurant_role_code ?? '',
      establecimientoId: data.establishment_id ?? null,
      logo: data.company?.url_logo ?? '',
    },
  };
}
