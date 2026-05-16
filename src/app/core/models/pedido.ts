export interface DetallePedidoRequest {
  idProducto: number;
  cantidad: number;
}

export interface PedidoRequest {
  idMesa: number;
  idUsuario: number;
  observacion: string;
  detalles: DetallePedidoRequest[];
}

export interface DetallePedido {
  idDetalle: number;
  idProducto: number;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  idPedido: number;
  fecha: string;
  hora: string;
  estado: string;
  observacion: string;
  total: number;
  idMesa: number;
  numeroMesa: number;
  idUsuario: number;
  nombreUsuario: string;
  detalles: DetallePedido[];
}