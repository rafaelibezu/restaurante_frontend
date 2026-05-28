export interface Reserva {
  idReserva: number;
  idCliente: number;
  nombreCliente: string;
  idMesa: number;
  numeroMesa: number;
  idUsuario: number;
  nombreUsuario: string;
  fechaReserva: string;
  horaReserva: string;
  cantidadPersonas: number;
  estado: string;
  observacion: string;
  fechaCreacion: string;
}

export interface ReservaRequest {
  idCliente: number;
  idMesa: number;
  idUsuario: number;
  fechaReserva: string;
  horaReserva: string;
  cantidadPersonas: number;
  estado: string;
  observacion: string;
}