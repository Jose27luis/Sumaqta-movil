import axios from 'axios';

interface CuerpoError {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

function primerError(errors?: Record<string, string[]>): string | null {
  if (!errors) {
    return null;
  }
  for (const campo of Object.keys(errors)) {
    const lista = errors[campo];
    if (Array.isArray(lista) && lista.length > 0 && typeof lista[0] === 'string') {
      return lista[0];
    }
  }
  return null;
}

export function mensajeError(
  error: unknown,
  porDefecto = 'Ocurrió un error inesperado. Intenta de nuevo.',
): string {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return 'La solicitud tardó demasiado. Revisa tu conexión e intenta de nuevo.';
    }
    if (!error.response) {
      return 'Sin conexión. Verifica tu red e intenta de nuevo.';
    }
    const cuerpo = error.response.data as CuerpoError | undefined;
    const validacion = primerError(cuerpo?.errors);
    if (validacion) {
      return validacion;
    }
    const delServidor = cuerpo?.message ?? cuerpo?.error;
    if (typeof delServidor === 'string' && delServidor.trim() !== '') {
      return delServidor;
    }
    switch (error.response.status) {
      case 401:
        return 'Tu sesión expiró. Vuelve a iniciar sesión.';
      case 403:
        return 'No tienes permiso para realizar esta acción.';
      case 404:
        return 'No se encontró el recurso solicitado.';
      case 413:
        return 'El archivo es demasiado grande para enviarse.';
      case 422:
        return 'Hay datos inválidos en la solicitud. Revísalos e intenta de nuevo.';
      case 429:
        return 'Demasiadas solicitudes seguidas. Espera un momento e intenta de nuevo.';
      case 500:
        return 'El servidor tuvo un problema. Intenta de nuevo en unos segundos.';
      case 502:
      case 503:
      case 504:
        return 'El servicio no está disponible en este momento. Intenta más tarde.';
      default:
        return `Error del servidor (${error.response.status}).`;
    }
  }
  if (error instanceof Error && error.message.trim() !== '') {
    return error.message;
  }
  return porDefecto;
}
