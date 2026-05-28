export interface Notificacion {
  idNotificacion: number;
  idCliente: number | null;
  nombreCliente: string | null;
  titulo: string;
  mensaje: string;
  tipo: string;
  estado: string;
  fechaGeneracion: string;
  fechaProgramada: string | null;
}

export interface NotificacionRequest {
  idCliente?: number | null;
  titulo: string;
  mensaje: string;
  tipo: string;
  estado?: string;
  fechaProgramada?: string | null;
}