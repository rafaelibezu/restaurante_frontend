import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PublicPromocion {
  idPromocion: number;
  nombre: string;
  descripcion: string;
  tipo: string;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  estado: boolean;
}

export interface PublicClienteRequest {
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
  fechaNacimiento?: string;
  preferencias?: string;
  alergias?: string;
  estado?: boolean;
}

export interface PublicClienteResponse {
  idCliente: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string;
}

export interface PublicReservaRequest {
  idCliente: number;
  idMesa: number;
  idUsuario: number;
  fechaReserva: string;
  horaReserva: string;
  cantidadPersonas: number;
  estado: string;
  observacion: string;
}

export interface PublicReservaResponse {
  idReserva: number;
  nombreCliente: string;
  numeroMesa: number;
  fechaReserva: string;
  horaReserva: string;
  cantidadPersonas: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class PublicService {
  private apiUrl = 'http://localhost:8080/api/public';

  constructor(private http: HttpClient) { }

  listarPromocionesVigentes(): Observable<PublicPromocion[]> {
    return this.http.get<PublicPromocion[]>(`${this.apiUrl}/promociones/vigentes`);
  }

  registrarCliente(data: PublicClienteRequest): Observable<PublicClienteResponse> {
    return this.http.post<PublicClienteResponse>(`${this.apiUrl}/clientes`, data);
  }

  crearReserva(data: PublicReservaRequest): Observable<PublicReservaResponse> {
    return this.http.post<PublicReservaResponse>(`${this.apiUrl}/reservas`, data);
  }
}