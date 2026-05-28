export interface Fidelizacion {
  idFidelizacion: number;
  idCliente: number;
  nombreCliente: string;
  puntos: number;
  nivel: string;
  descuentoDisponible: number;
  fechaActualizacion: string;
}

export interface FidelizacionRequest {
  idCliente: number;
  puntos: number;
  nivel?: string;
  descuentoDisponible?: number;
}