export interface Venta {
  idVenta: number;
  fecha: string;
  total: number;
  metodoPago: string;
  estado: string;
  idPedido: number;
  idUsuario: number;
  nombreUsuario: string;
}

export interface VentaRequest {
  idPedido: number;
  idUsuario: number;
  metodoPago: string;
}