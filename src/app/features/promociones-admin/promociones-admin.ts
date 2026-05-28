import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Promocion, PromocionRequest } from '../../core/models/promocion';
import { PromocionService } from '../../core/services/promocion';

@Component({
  selector: 'app-promociones-admin',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './promociones-admin.html',
  styleUrl: './promociones-admin.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromocionesAdmin implements OnInit {

  promociones: Promocion[] = [];
  promocionesFiltradas: Promocion[] = [];

  visible = false;
  editando = false;
  idEditando?: number;
  cargandoListado = false;

  filtroEstado = 'Todos';

  estados = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Activas', value: 'Activas' },
    { label: 'Inactivas', value: 'Inactivas' },
    { label: 'Vigentes', value: 'Vigentes' }
  ];

  tipos = [
    { label: 'Porcentaje', value: 'Porcentaje' },
    { label: 'Monto fijo', value: 'Monto fijo' },
    { label: 'Cumpleanos', value: 'Cumpleanos' },
    { label: 'Cliente frecuente', value: 'Cliente frecuente' }
  ];

  form: PromocionRequest = this.formVacio();

  constructor(
    private promocionService: PromocionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.markForCheck();

    this.promocionService.listar().subscribe({
      next: data => {
        this.promociones = data;
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
          title: 'No se pudieron cargar las promociones',
          text: 'Revisa la conexion con el servidor e intentalo nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  aplicarFiltro(): void {
    const hoy = new Date();

    if (this.filtroEstado === 'Todos') {
      this.promocionesFiltradas = this.promociones;
    }

    if (this.filtroEstado === 'Activas') {
      this.promocionesFiltradas = this.promociones.filter(p => p.estado);
    }

    if (this.filtroEstado === 'Inactivas') {
      this.promocionesFiltradas = this.promociones.filter(p => !p.estado);
    }

    if (this.filtroEstado === 'Vigentes') {
      this.promocionesFiltradas = this.promociones.filter(p => {
        const inicio = new Date(p.fechaInicio);
        const fin = new Date(p.fechaFin);
        return p.estado && inicio <= hoy && fin >= hoy;
      });
    }

    this.cdr.markForCheck();
  }

  abrirNuevo(): void {
    this.visible = true;
    this.editando = false;
    this.idEditando = undefined;
    this.form = this.formVacio();
  }

  cerrarModal(): void {
    this.visible = false;
  }

  editar(promocion: Promocion): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = promocion.idPromocion;

    this.form = {
      nombre: promocion.nombre,
      descripcion: promocion.descripcion,
      tipo: this.normalizarTipo(promocion.tipo),
      valorDescuento: promocion.valorDescuento,
      fechaInicio: promocion.fechaInicio,
      fechaFin: promocion.fechaFin,
      estado: promocion.estado
    };
  }

  guardar(): void {
    if (!this.form.nombre || !this.form.tipo || !this.form.fechaInicio || !this.form.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos incompletos',
        text: 'Completa nombre, tipo y fechas de la promocion.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#17213f'
      });
      return;
    }

    if (new Date(this.form.fechaFin) < new Date(this.form.fechaInicio)) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas invalidas',
        text: 'La fecha fin no puede ser menor que la fecha inicio.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#17213f'
      });
      return;
    }

    const request: PromocionRequest = {
      ...this.form,
      tipo: this.normalizarTipo(this.form.tipo)
    };

    const operacion = this.editando && this.idEditando
      ? this.promocionService.actualizar(this.idEditando, request)
      : this.promocionService.crear(request);

    operacion.subscribe({
      next: () => {
        this.visible = false;
        Swal.fire({
          icon: 'success',
          title: this.editando ? 'Promocion actualizada' : 'Promocion creada',
          text: this.editando
            ? 'La promocion fue actualizada correctamente.'
            : 'La promocion ya esta disponible para el portal cliente si esta vigente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#17213f'
        });
        this.listar();
      },
      error: error => {
        console.error(error);

        Swal.fire({
          icon: 'error',
          title: 'No se pudo guardar',
          text: 'Ocurrio un problema al guardar la promocion.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  eliminar(promocion: Promocion): void {
    Swal.fire({
      icon: 'warning',
      title: 'Desactivar promocion',
      text: `Seguro que deseas desactivar la promocion "${promocion.nombre}"?`,
      showCancelButton: true,
      confirmButtonText: 'Si, desactivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.promocionService.eliminar(promocion.idPromocion).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Promocion desactivada',
            text: 'La promocion fue desactivada correctamente.',
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
            text: 'Ocurrio un problema al desactivar la promocion.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#17213f'
          });
        }
      });
    });
  }

  estaVigente(promocion: Promocion): boolean {
    const hoy = new Date();
    const inicio = new Date(promocion.fechaInicio);
    const fin = new Date(promocion.fechaFin);

    return promocion.estado && inicio <= hoy && fin >= hoy;
  }

  textoDescuento(promocion: Promocion): string {
    if (promocion.tipo === 'Monto fijo') {
      return `S/ ${promocion.valorDescuento}`;
    }

    return `${promocion.valorDescuento}%`;
  }

  estadoClass(promocion: Promocion): string {
    if (!promocion.estado) return 'badge-danger';
    if (this.estaVigente(promocion)) return 'badge-success';
    return 'badge-warning';
  }

  textoEstado(promocion: Promocion): string {
    if (!promocion.estado) return 'Inactiva';
    if (this.estaVigente(promocion)) return 'Vigente';
    return 'Activa no vigente';
  }

  tipoClass(tipo: string): string {
    const tipoNormalizado = this.normalizarTipo(tipo);

    if (tipoNormalizado === 'Monto fijo') return 'type-fixed';
    if (tipoNormalizado === 'Cumpleanos') return 'type-birthday';
    if (tipoNormalizado === 'Cliente frecuente') return 'type-loyal';
    return 'type-percent';
  }

  totalActivas(): number {
    return this.promociones.filter(p => p.estado).length;
  }

  totalVigentes(): number {
    return this.promociones.filter(p => this.estaVigente(p)).length;
  }

  totalInactivas(): number {
    return this.promociones.filter(p => !p.estado).length;
  }

  private formVacio(): PromocionRequest {
    return {
      nombre: '',
      descripcion: '',
      tipo: 'Porcentaje',
      valorDescuento: 0,
      fechaInicio: '',
      fechaFin: '',
      estado: true
    };
  }

  private normalizarTipo(tipo: string): string {
    return tipo
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
