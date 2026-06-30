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

export async function login(
  tenant: string,
  email: string,
  password: string
): Promise<ResultadoLogin> {
  const baseUrl = resolverBaseUrl(tenant);
  const { data } = await axios.post<LoginResponse>(
    `${baseUrl}/login`,
    { email, password },
    { timeout: env.requestTimeout }
  );
  if (!data.success || !data.token) {
    throw new Error(data.message ?? 'No se pudo iniciar sesión.');
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
