import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { delay } from 'rxjs';

import { Venta, VentaRequest } from '../../core/models/venta';
import { VentaService } from '../../core/services/venta';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './ventas.html',
  styleUrl: './ventas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Ventas implements OnInit {

  ventas: Venta[] = [];
  cargandoListado = false;
  visible = false;

  metodosPago = [
    { label: 'Efectivo', value: 'Efectivo' },
    { label: 'Yape', value: 'Yape' },
    { label: 'Tarjeta', value: 'Tarjeta' }
  ];

  form: VentaRequest = {
    idPedido: 0,
    idUsuario: 0,
    metodoPago: 'Yape'
  };

  constructor(
    private ventaService: VentaService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.detectChanges();

    this.ventaService.listar().pipe(delay(2000)).subscribe({
      next: data => {
        this.ventas = data;
        this.cargandoListado = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoListado = false;
        this.cdr.detectChanges();
      }
    });
  }

  abrirNuevo(): void {
    const usuario = this.authService.getUsuario();
    this.visible = true;
    this.form = {
      idPedido: 0,
      idUsuario: usuario?.idUsuario ?? 0,
      metodoPago: 'Yape'
    };
  }

  registrar(): void {
    this.ventaService.registrar(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Venta registrada correctamente');
        this.listar();
      }
    });
  }

  estadoClass(estado: string): string {
    if (estado === 'Pagado') return 'badge-success';
    if (estado === 'Pendiente') return 'badge-warning';
    if (estado === 'Anulado') return 'badge-danger';
    return 'badge-info';
  }
}
