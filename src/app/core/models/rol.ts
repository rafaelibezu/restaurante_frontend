export interface Rol {
  idRol: number;
  nombreRol: string;
  estado: boolean;
}

export interface RolRequest {
  nombreRol: string;
  estado?: boolean;
}