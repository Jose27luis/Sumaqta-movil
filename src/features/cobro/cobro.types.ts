export type TipoComprobante = 'boleta' | 'factura' | 'nota';

export interface MedioPago {
  id: string;
  descripcion: string;
  esEfectivo: boolean;
  tieneTarjeta: boolean;
}

export interface LineaCuenta {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Cuenta {
  items: LineaCuenta[];
  total: number;
}

export interface ClienteBusqueda {
  id: number;
  nombre: string;
  numero: string;
  tipoDocumento: string;
}

export interface ResultadoCobro {
  estado: 'cobrada' | 'deshabilitado';
}
