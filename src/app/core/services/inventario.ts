import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inventario, InventarioRequest } from '../models/inventario';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private apiUrl = `${environment.apiUrl}/inventario`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Inventario[]> {
    return this.http.get<Inventario[]>(this.apiUrl);
  }

  crear(data: InventarioRequest): Observable<Inventario> {
    return this.http.post<Inventario>(this.apiUrl, data);
  }

  actualizar(id: number, data: InventarioRequest): Observable<Inventario> {
    return this.http.put<Inventario>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
