export interface DashboardResponse {
  totalPedidos: number;
  pedidosPendientes: number;
  pedidosEntregados: number;
  mesasOcupadas: number;
  mesasDisponibles: number;
  productosStockBajo: number;
  ventasTotales: number;
}