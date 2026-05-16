import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rol, RolRequest } from '../models/rol';

@Injectable({ providedIn: 'root' })
export class RolService {
  private apiUrl = 'http://localhost:8080/api/roles';

  constructor(private http: HttpClient) {}

  listar(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  crear(data: RolRequest): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, data);
  }

  actualizar(id: number, data: RolRequest): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, data);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}