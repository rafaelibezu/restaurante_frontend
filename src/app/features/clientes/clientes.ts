import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Cliente, HistorialConsumo } from '../../core/models/cliente';
import { ClienteService } from '../../core/services/cliente';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Clientes implements OnInit {

  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];

  busqueda = '';
  cargandoListado = false;

  visibleHistorial = false;
  historial?: HistorialConsumo;
  cargandoHistorial = false;

  constructor(
    private clienteService: ClienteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.markForCheck();

    this.clienteService.listar().subscribe({
      next: data => {
        this.clientes = data;
        this.aplicarBusqueda();
        this.cargandoListado = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error(error);
        this.cargandoListado = false;
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar los clientes',
          text: 'Revisa la conexion con el servidor e intentalo nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  aplicarBusqueda(): void {
    const texto = this.busqueda.toLowerCase().trim();

    if (!texto) {
      this.clientesFiltrados = this.clientes;
    } else {
      this.clientesFiltrados = this.clientes.filter(cliente =>
        `${cliente.nombre} ${cliente.apellido}`.toLowerCase().includes(texto) ||
        cliente.telefono?.toLowerCase().includes(texto) ||
        cliente.correo?.toLowerCase().includes(texto) ||
        cliente.preferencias?.toLowerCase().includes(texto)
      );
    }

    this.cdr.markForCheck();
  }

  verHistorial(cliente: Cliente): void {
    this.visibleHistorial = true;
    this.cargandoHistorial = true;
    this.historial = undefined;
    this.cdr.markForCheck();

    this.clienteService.obtenerHistorialConsumo(cliente.idCliente).subscribe({
      next: data => {
        this.historial = data;
        this.cargandoHistorial = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error(error);
        this.cargandoHistorial = false;
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar el historial',
          text: 'Intentalo nuevamente en unos segundos.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  cerrarHistorial(): void {
    this.visibleHistorial = false;
    this.historial = undefined;
    this.cargandoHistorial = false;
  }

  eliminar(cliente: Cliente): void {
    Swal.fire({
      icon: 'warning',
      title: 'Desactivar cliente',
      text: `Seguro que deseas desactivar a ${cliente.nombre}?`,
      showCancelButton: true,
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.clienteService.eliminar(cliente.idCliente).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Cliente desactivado',
            text: 'El cliente fue desactivado correctamente.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#17213f'
          });
          this.listar();
        },
        error: error => {
          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'No se pudo desactivar',
            text: 'Ocurrio un problema al desactivar el cliente.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#17213f'
          });
        }
      });
    });
  }

  estadoCliente(cliente: Cliente): string {
    return cliente.estado ? 'Activo' : 'Inactivo';
  }

  estadoClass(cliente: Cliente): string {
    return cliente.estado ? 'badge-success' : 'badge-danger';
  }

  totalActivos(): number {
    return this.clientes.filter(c => c.estado).length;
  }

  totalConAlergias(): number {
    return this.clientes.filter(c => c.alergias && c.alergias.trim().length > 0).length;
  }

  totalConPreferencias(): number {
    return this.clientes.filter(c => c.preferencias && c.preferencias.trim().length > 0).length;
  }
}
