export interface Promocion {
  idPromocion: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  estado: boolean;
}

export interface PromocionRequest {
  nombre: string;
  descripcion: string;
  tipo: string;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  estado?: boolean;
}