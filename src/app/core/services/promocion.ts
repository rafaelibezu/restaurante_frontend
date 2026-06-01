import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Promocion, PromocionRequest } from '../models/promocion';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {

  private apiUrl = `${environment.apiUrl}/promociones`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(this.apiUrl);
  }

  listarActivas(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/activas`);
  }

  listarVigentes(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/vigentes`);
  }

  obtenerPorId(id: number): Observable<Promocion> {
    return this.http.get<Promocion>(`${this.apiUrl}/${id}`);
  }

  crear(data: PromocionRequest): Observable<Promocion> {
    return this.http.post<Promocion>(this.apiUrl, data);
  }

  actualizar(id: number, data: PromocionRequest): Observable<Promocion> {
    return this.http.put<Promocion>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
