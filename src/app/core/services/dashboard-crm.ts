import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardCrm } from '../../features/dashboard-crm/dominio/DashboardCRM';

@Injectable({ providedIn: 'root' })
export class DashboardCrmService {
  private apiUrl = 'http://localhost:8080/api/dashboard/crm';

  constructor(private http: HttpClient) {}

  obtenerDashboardCrm(): Observable<DashboardCrm> {
    return this.http.get<DashboardCrm>(this.apiUrl);
  }
}
