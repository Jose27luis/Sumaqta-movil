export function fmtMoneda(valor: number): string {
  return `S/ ${valor.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function fmtNumero(valor: number): string {
  return valor.toLocaleString('es-PE');
}

export function fmtMonto(valor: number, moneda = 'PEN'): string {
  const simbolo = moneda === 'USD' ? '$' : 'S/';
  return `${simbolo} ${valor.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
