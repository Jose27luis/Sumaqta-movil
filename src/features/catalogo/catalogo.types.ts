export interface Categoria {
  id: number;
  nombre: string;
  icono: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  categoriaId: number;
  codigo: string;
  unidadId: string;
  afectacionIgv: string;
  favorito: boolean;
}
