import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DashboardCrm as DashboardCrmData } from './dominio/DashboardCRM';
import { DashboardCrmService } from '../../core/services/dashboard-crm';

@Component({
  selector: 'app-dashboard-crm',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard-crm.html',
  styleUrl: './dashboard-crm.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardCrm implements OnInit {

  data?: DashboardCrmData;
  cargando = true;
  error = '';

  constructor(
    private dashboardCrmService: DashboardCrmService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.cargando = true;
    this.error = '';

    this.dashboardCrmService.obtenerDashboardCrm().subscribe({
      next: response => {
        this.data = response;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar la informacion del dashboard CRM.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  get otrosClientes(): number {
    if (!this.data) return 0;
    return Math.max(this.data.totalClientes - this.data.clientesFrecuentes - this.data.clientesInactivos, 0);
  }

  get clientesFrecuentesPct(): number {
    return this.porcentaje(this.data?.clientesFrecuentes ?? 0, this.data?.totalClientes ?? 0);
  }

  get clientesInactivosPct(): number {
    return this.porcentaje(this.data?.clientesInactivos ?? 0, this.data?.totalClientes ?? 0);
  }

  get otrosClientesPct(): number {
    return Math.max(100 - this.clientesFrecuentesPct - this.clientesInactivosPct, 0);
  }

  get actividadMaxima(): number {
    if (!this.data) return 1;
    return Math.max(
      this.data.reservasPendientes,
      this.data.promocionesActivas,
      this.data.notificacionesPendientes,
      1
    );
  }

  private porcentaje(valor: number, total: number): number {
    return total ? Math.round((valor / total) * 100) : 0;
  }
}
