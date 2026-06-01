import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fidelizacion, FidelizacionRequest } from '../models/fidelizacion';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FidelizacionService {

  private apiUrl = `${environment.apiUrl}/fidelizacion`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Fidelizacion[]> {
    return this.http.get<Fidelizacion[]>(this.apiUrl);
  }

  obtenerPorId(id: number): Observable<Fidelizacion> {
    return this.http.get<Fidelizacion>(`${this.apiUrl}/${id}`);
  }

  obtenerPorCliente(idCliente: number): Observable<Fidelizacion> {
    return this.http.get<Fidelizacion>(`${this.apiUrl}/cliente/${idCliente}`);
  }

  crear(data: FidelizacionRequest): Observable<Fidelizacion> {
    return this.http.post<Fidelizacion>(this.apiUrl, data);
  }

  actualizar(id: number, data: FidelizacionRequest): Observable<Fidelizacion> {
    return this.http.put<Fidelizacion>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
