export interface Usuario {
  idUsuario: number;
  nombre: string;
  correo: string;
  telefono: string;
  estado: boolean;
  idRol: number;
  nombreRol: string;
}

export interface UsuarioRequest {
  nombre: string;
  correo: string;
  password: string;
  telefono: string;
  estado?: boolean;
  idRol: number;
}