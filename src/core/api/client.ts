import axios, { AxiosInstance } from 'axios';

import { env } from '@/core/config/env';
import { useSession } from '@/core/auth/session';
import { mensajeError } from '@/core/api/errores';

export function resolverBaseUrl(tenant: string): string {
  const limpio = tenant.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!limpio) {
    return '';
  }
  const dominio = limpio.includes('.') ? limpio : `${limpio}.${env.baseDomain}`;
  return `https://${dominio}/api`;
}

export const api: AxiosInstance = axios.create({
  timeout: env.requestTimeout,
});

api.interceptors.request.use((config) => {
  const { tenant, token } = useSession.getState();
  config.baseURL = resolverBaseUrl(tenant);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        void useSession.getState().cerrar();
      }
      error.message = mensajeError(error);
    }
    return Promise.reject(error);
  }
);
