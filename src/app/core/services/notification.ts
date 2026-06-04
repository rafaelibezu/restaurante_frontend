import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notificacion, NotificacionRequest } from '../models/notification';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {

  private apiUrl = `${environment.apiUrl}/notificaciones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(this.apiUrl);
  }

  listarPendientes(): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/pendientes`);
  }

  obtenerPorId(id: number): Observable<Notificacion> {
    return this.http.get<Notificacion>(`${this.apiUrl}/${id}`);
  }

  listarPorTipo(tipo: string): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/tipo/${tipo}`);
  }

  listarPorCliente(idCliente: number): Observable<Notificacion[]> {
    return this.http.get<Notificacion[]>(`${this.apiUrl}/cliente/${idCliente}`);
  }

  crear(data: NotificacionRequest): Observable<Notificacion> {
    return this.http.post<Notificacion>(this.apiUrl, data);
  }

  cambiarEstado(id: number, estado: string): Observable<Notificacion> {
    return this.http.patch<Notificacion>(`${this.apiUrl}/${id}/estado?estado=${estado}`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
