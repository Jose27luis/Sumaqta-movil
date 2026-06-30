export type TipoDocumento = 'dni' | 'ruc' | 'desconocido';

export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

export function validarDni(valor: string): boolean {
  const limpio = soloDigitos(valor);
  return /^\d{8}$/.test(limpio);
}

export function validarRuc(valor: string): boolean {
  const limpio = soloDigitos(valor);
  if (!/^\d{11}$/.test(limpio)) {
    return false;
  }
  const prefijo = limpio.slice(0, 2);
  if (!['10', '15', '16', '17', '20'].includes(prefijo)) {
    return false;
  }
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += Number(limpio[i]) * factores[i];
  }
  const resto = suma % 11;
  let verificador = 11 - resto;
  if (verificador === 10) {
    verificador = 0;
  } else if (verificador === 11) {
    verificador = 1;
  }
  return verificador === Number(limpio[10]);
}

export function tipoDocumento(valor: string): TipoDocumento {
  const limpio = soloDigitos(valor);
  if (limpio.length === 8) {
    return 'dni';
  }
  if (limpio.length === 11) {
    return 'ruc';
  }
  return 'desconocido';
}

export function errorDocumento(valor: string): string | null {
  const limpio = soloDigitos(valor);
  if (limpio.length === 8) {
    return validarDni(limpio) ? null : 'El DNI debe tener 8 dígitos.';
  }
  if (limpio.length === 11) {
    return validarRuc(limpio) ? null : 'El RUC no es válido. Revisa los dígitos.';
  }
  return 'Ingresa un DNI (8 dígitos) o RUC (11 dígitos).';
}

export interface MontoValidado {
  valido: boolean;
  valor: number;
  error: string | null;
}

export function validarMonto(
  texto: string,
  opciones: { min?: number; max?: number; obligatorio?: boolean } = {},
): MontoValidado {
  const { min = 0, max, obligatorio = true } = opciones;
  const limpio = texto.replace(',', '.').replace(/[^0-9.]/g, '');
  if (limpio.trim() === '') {
    return { valido: !obligatorio, valor: 0, error: obligatorio ? 'Ingresa un monto.' : null };
  }
  const valor = Number(limpio);
  if (Number.isNaN(valor)) {
    return { valido: false, valor: 0, error: 'El monto no es válido.' };
  }
  if (valor < min) {
    return { valido: false, valor, error: `El monto debe ser mayor o igual a ${min}.` };
  }
  if (max !== undefined && valor > max) {
    return { valido: false, valor, error: `El monto no puede superar ${max}.` };
  }
  return { valido: true, valor: Math.round(valor * 100) / 100, error: null };
}
