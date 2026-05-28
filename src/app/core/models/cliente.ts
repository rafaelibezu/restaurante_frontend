export interface Cliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  fechaNacimiento: string;
  preferencias: string;
  alergias: string;
  fechaRegistro: string;
  ultimaVisita: string | null;
  estado: boolean;
}

export interface ClienteRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  fechaNacimiento?: string;
  preferencias?: string;
  alergias?: string;
  estado?: boolean;
}

export interface HistorialConsumo {
  idCliente: number;
  nombreCliente: string;
  cantidadPedidos: number;
  totalGastado: number;
  ticketPromedio: number;
  ultimaVisita: string | null;
  pedidos: any[];
}