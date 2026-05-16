export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion: string;
  estado?: boolean;
}