import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reserva, ReservaRequest } from '../models/reserva';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {

  private apiUrl = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`);
  }

  listarPorEstado(estado: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/estado/${estado}`);
  }

  listarPorFecha(fecha: string): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/fecha/${fecha}`);
  }

  crear(data: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, data);
  }

  actualizar(id: number, data: ReservaRequest): Observable<Reserva> {
    return this.http.put<Reserva>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
