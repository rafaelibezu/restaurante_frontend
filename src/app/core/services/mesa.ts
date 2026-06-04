import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { Mesa, MesaRequest } from '../models/mesa';

@Injectable({ providedIn: 'root' })
export class MesaService {
  private apiUrl = `${environment.apiUrl}/mesas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Mesa[]> {
    return this.http.get<Mesa[]>(this.apiUrl);
  }

  crear(data: MesaRequest): Observable<Mesa> {
    return this.http.post<Mesa>(this.apiUrl, data);
  }

  actualizar(id: number, data: MesaRequest): Observable<Mesa> {
    return this.http.put<Mesa>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
