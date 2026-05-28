import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Notificacion } from '../../core/models/notification';
import { NotificacionService } from '../../core/services/notification';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Notificaciones implements OnInit {

  notificaciones: Notificacion[] = [];
  notificacionesFiltradas: Notificacion[] = [];

  filtroEstado = 'Todos';
  filtroTipo = 'Todos';
  cargandoListado = false;

  estados = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'Leida', value: 'Leida' },
    { label: 'Atendida', value: 'Atendida' },
    { label: 'Descartada', value: 'Descartada' }
  ];

  tipos = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Reserva', value: 'Reserva' },
    { label: 'Cumpleanos', value: 'Cumpleanos' },
    { label: 'Promocion', value: 'Promocion' },
    { label: 'Stock critico', value: 'Stock critico' },
    { label: 'Cliente inactivo', value: 'Cliente inactivo' },
    { label: 'General', value: 'General' }
  ];

  constructor(
    private notificacionService: NotificacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.markForCheck();

    this.notificacionService.listar().subscribe({
      next: data => {
        this.notificaciones = data.sort((a, b) =>
          new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime()
        );
        this.aplicarFiltros();
        this.cargandoListado = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error(error);
        this.cargandoListado = false;
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'error',
          title: 'No se pudieron cargar las notificaciones',
          text: 'Revisa la conexion con el servidor e intentalo nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  aplicarFiltros(): void {
    this.notificacionesFiltradas = this.notificaciones.filter(n => {
      const cumpleEstado = this.filtroEstado === 'Todos' || n.estado === this.filtroEstado;
      const cumpleTipo = this.filtroTipo === 'Todos' || this.normalizarTipo(n.tipo) === this.filtroTipo;
      return cumpleEstado && cumpleTipo;
    });

    this.cdr.markForCheck();
  }

  cambiarEstado(notificacion: Notificacion, estado: string): void {
    this.notificacionService.cambiarEstado(notificacion.idNotificacion, estado).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Notificacion actualizada',
          text: `La notificacion fue marcada como ${estado}.`,
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
          text: 'Ocurrio un problema al cambiar el estado de la notificacion.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  marcarLeida(notificacion: Notificacion): void {
    this.cambiarEstado(notificacion, 'Leida');
  }

  atender(notificacion: Notificacion): void {
    this.cambiarEstado(notificacion, 'Atendida');
  }

  descartar(notificacion: Notificacion): void {
    Swal.fire({
      icon: 'warning',
      title: 'Descartar notificacion',
      text: 'Seguro que deseas descartar esta notificacion?',
      showCancelButton: true,
      confirmButtonText: 'Si, descartar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.notificacionService.eliminar(notificacion.idNotificacion).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Notificacion descartada',
            text: 'La notificacion fue descartada correctamente.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#17213f'
          });
          this.listar();
        },
        error: error => {
          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'No se pudo descartar',
            text: 'Ocurrio un problema al descartar la notificacion.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#17213f'
          });
        }
      });
    });
  }

  estadoClass(estado: string): string {
    if (estado === 'Pendiente') return 'badge-warning';
    if (estado === 'Leida') return 'badge-info';
    if (estado === 'Atendida') return 'badge-success';
    if (estado === 'Descartada') return 'badge-secondary';
    return 'badge-info';
  }

  tipoClass(tipo: string): string {
    const tipoNormalizado = this.normalizarTipo(tipo);

    if (tipoNormalizado === 'Reserva') return 'type-reserva';
    if (tipoNormalizado === 'Cumpleanos') return 'type-cumpleanos';
    if (tipoNormalizado === 'Promocion') return 'type-promocion';
    if (tipoNormalizado === 'Stock critico') return 'type-stock';
    if (tipoNormalizado === 'Cliente inactivo') return 'type-cliente';
    return 'type-general';
  }

  inicialTipo(tipo: string): string {
    if (tipo === 'Stock critico') return 'SC';
    if (tipo === 'Cliente inactivo') return 'CI';
    return (tipo || 'N').slice(0, 1).toUpperCase();
  }

  totalPorEstado(estado: string): number {
    return this.notificaciones.filter(n => n.estado === estado).length;
  }

  private normalizarTipo(tipo: string): string {
    return tipo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
