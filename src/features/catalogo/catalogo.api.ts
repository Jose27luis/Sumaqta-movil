import { api } from '@/core/api/client';
import { Categoria, Producto } from './catalogo.types';

type Fila = Record<string, unknown>;

function numero(fila: Fila, clave: string): number {
  const valor = fila[clave];
  if (typeof valor === 'number') {
    return valor;
  }
  if (typeof valor === 'string' && valor.trim() !== '' && !Number.isNaN(Number(valor))) {
    return Number(valor);
  }
  return 0;
}

function texto(fila: Fila, clave: string): string {
  const valor = fila[clave];
  return typeof valor === 'string' ? valor : valor == null ? '' : String(valor);
}

function bandera(fila: Fila, clave: string): boolean {
  return fila[clave] === true || fila[clave] === 1 || fila[clave] === '1';
}

function soloFilas(lista: unknown): Fila[] {
  return (Array.isArray(lista) ? lista : []).filter(
    (f): f is Fila => typeof f === 'object' && f !== null
  );
}

interface ListaResponse {
  data?: unknown[];
  success?: boolean;
}

function mapProducto(fila: Fila): Producto {
  return {
    id: numero(fila, 'id'),
    nombre: texto(fila, 'description'),
    precio: numero(fila, 'price'),
    stock: numero(fila, 'stock'),
    imagen: texto(fila, 'image_url'),
    categoriaId: numero(fila, 'category_id'),
    codigo: texto(fila, 'item_code'),
    unidadId: texto(fila, 'unit_type_id'),
    afectacionIgv: texto(fila, 'sale_affectation_igv_type_id'),
    favorito: bandera(fila, 'restaurant_favorite'),
  };
}

function mapCategoria(fila: Fila): Categoria {
  return {
    id: numero(fila, 'id'),
    nombre: texto(fila, 'name'),
    icono: texto(fila, 'icon'),
  };
}

export async function obtenerProductos(): Promise<Producto[]> {
  const { data } = await api.get<ListaResponse>('/restaurant/items');
  return soloFilas(data.data).map(mapProducto);
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  const { data } = await api.get<ListaResponse>('/restaurant/categories');
  return soloFilas(data.data).map(mapCategoria);
}
