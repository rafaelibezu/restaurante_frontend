import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Reserva, ReservaRequest } from '../../core/models/reserva';
import { ReservaService } from '../../core/services/reserva';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Reservas implements OnInit {

  reservas: Reserva[] = [];
  reservasFiltradas: Reserva[] = [];

  filtroEstado = 'Todos';
  cargandoListado = false;

  estados = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Confirmada', value: 'Confirmada' },
    { label: 'Cancelada', value: 'Cancelada' },
    { label: 'Atendida', value: 'Atendida' },
    { label: 'No asistio', value: 'No asistio' }
  ];

  constructor(
    private reservaService: ReservaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.markForCheck();

    this.reservaService.listar().subscribe({
      next: data => {
        this.reservas = data;
        this.aplicarFiltro();
        this.cargandoListado = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error(error);
        this.cargandoListado = false;
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar las reservas',
          text: 'Revisa la conexion con el servidor e intentalo nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'Todos') {
      this.reservasFiltradas = this.reservas;
    } else {
      this.reservasFiltradas = this.reservas.filter(r => r.estado === this.filtroEstado);
    }

    this.cdr.markForCheck();
  }

  cambiarEstado(reserva: Reserva, nuevoEstado: string): void {
    const request: ReservaRequest = {
      idCliente: reserva.idCliente,
      idMesa: reserva.idMesa,
      idUsuario: reserva.idUsuario,
      fechaReserva: reserva.fechaReserva,
      horaReserva: reserva.horaReserva,
      cantidadPersonas: reserva.cantidadPersonas,
      estado: nuevoEstado,
      observacion: reserva.observacion
    };

    this.reservaService.actualizar(reserva.idReserva, request).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Reserva actualizada',
          text: `La reserva fue marcada como ${nuevoEstado}.`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#17213f'
        });
        this.listar();
      },
      error: error => {
        console.error(error);

        Swal.fire({
          icon: 'error',
          title: 'No se pudo actualizar',
          text: 'Ocurrio un problema al cambiar el estado de la reserva.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  confirmarReserva(reserva: Reserva): void {
    this.cambiarEstado(reserva, 'Confirmada');
  }

  atenderReserva(reserva: Reserva): void {
    this.cambiarEstado(reserva, 'Atendida');
  }

  cancelarReserva(reserva: Reserva): void {
    Swal.fire({
      icon: 'warning',
      title: 'Cancelar reserva',
      text: 'Seguro que deseas cancelar esta reserva?',
      showCancelButton: true,
      confirmButtonText: 'Si, cancelar',
      cancelButtonText: 'No',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    }).then(result => {
      if (result.isConfirmed) {
        this.cambiarEstado(reserva, 'Cancelada');
      }
    });
  }

  estadoClass(estado: string): string {
    if (estado === 'Confirmada') return 'badge-success';
    if (estado === 'Pendiente') return 'badge-warning';
    if (estado === 'Cancelada') return 'badge-danger';
    if (estado === 'Atendida') return 'badge-info';
    if (estado === 'No asistio') return 'badge-secondary';
    return 'badge-info';
  }

  totalPorEstado(estado: string): number {
    return this.reservas.filter(r => r.estado === estado).length;
  }
}
