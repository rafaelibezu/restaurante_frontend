import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardCrm } from '../../features/dashboard-crm/dominio/DashboardCRM';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class DashboardCrmService {
  private apiUrl = `${environment.apiUrl}/dashboard/crm`;

  constructor(private http: HttpClient) {}

  obtenerDashboardCrm(): Observable<DashboardCrm> {
    return this.http.get<DashboardCrm>(this.apiUrl);
  }
}
