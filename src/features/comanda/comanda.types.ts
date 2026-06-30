export interface Batch {
  commandBatchId: string | null;
  tableSessionId: string | null;
}

export type EstadoComanda = 'enviada' | 'deshabilitada';

export interface ResultadoComanda {
  estado: EstadoComanda;
  guardados: number;
  fallidos: number;
  impreso: boolean;
}
