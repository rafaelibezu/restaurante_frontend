export interface Mesa {
  idMesa: number;
  numero: number;
  capacidad: number;
  estado: string;
}

export interface MesaRequest {
  numero: number;
  capacidad: number;
  estado?: string;
}