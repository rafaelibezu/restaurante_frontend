export interface Inventario {
  idInventario: number;
  idProducto: number;
  nombreProducto: string;
  cantidadActual: number;
  stockMinimo: number;
  fechaActualizacion: string;
  stockBajo: boolean;
}

export interface InventarioRequest {
  idProducto: number;
  cantidadActual: number;
  stockMinimo: number;
}