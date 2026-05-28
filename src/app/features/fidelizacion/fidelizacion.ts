import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Fidelizacion as FidelizacionModel, FidelizacionRequest } from '../../core/models/fidelizacion';
import { FidelizacionService } from '../../core/services/fidelizacion';

@Component({
  selector: 'app-fidelizacion',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './fidelizacion.html',
  styleUrl: './fidelizacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Fidelizacion implements OnInit {

  fidelizaciones: FidelizacionModel[] = [];
  fidelizacionesFiltradas: FidelizacionModel[] = [];

  visible = false;
  editando = false;
  idEditando?: number;
  cargandoListado = false;

  filtroNivel = 'Todos';
  busqueda = '';

  niveles = [
    { label: 'Todos', value: 'Todos' },
    { label: 'Bronce', value: 'Bronce' },
    { label: 'Plata', value: 'Plata' },
    { label: 'Oro', value: 'Oro' },
    { label: 'VIP', value: 'VIP' }
  ];

  nivelesForm = [
    { label: 'Automatico', value: '' },
    { label: 'Bronce', value: 'Bronce' },
    { label: 'Plata', value: 'Plata' },
    { label: 'Oro', value: 'Oro' },
    { label: 'VIP', value: 'VIP' }
  ];

  form: FidelizacionRequest = this.formVacio();

  constructor(
    private fidelizacionService: FidelizacionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.markForCheck();

    this.fidelizacionService.listar().subscribe({
      next: data => {
        this.fidelizaciones = data;
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
          title: 'No se pudo cargar fidelizacion',
          text: 'Revisa la conexion con el servidor e intentalo nuevamente.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  aplicarFiltros(): void {
    const texto = this.busqueda.toLowerCase().trim();

    this.fidelizacionesFiltradas = this.fidelizaciones.filter(item => {
      const cumpleNivel = this.filtroNivel === 'Todos' || item.nivel === this.filtroNivel;
      const cumpleBusqueda =
        !texto ||
        item.nombreCliente.toLowerCase().includes(texto) ||
        item.idCliente.toString().includes(texto);

      return cumpleNivel && cumpleBusqueda;
    });

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

  editar(item: FidelizacionModel): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = item.idFidelizacion;

    this.form = {
      idCliente: item.idCliente,
      puntos: item.puntos,
      nivel: item.nivel,
      descuentoDisponible: item.descuentoDisponible
    };
  }

  guardar(): void {
    if (!this.form.idCliente || this.form.puntos < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Datos invalidos',
        text: 'Ingresa un cliente valido y puntos mayores o iguales a 0.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#17213f'
      });
      return;
    }

    const descuento = this.form.descuentoDisponible ?? 0;

    if (descuento < 0 || descuento > 100) {
      Swal.fire({
        icon: 'warning',
        title: 'Descuento invalido',
        text: 'El descuento debe estar entre 0 y 100.',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#17213f'
      });
      return;
    }

    const request: FidelizacionRequest = {
      idCliente: this.form.idCliente,
      puntos: this.form.puntos,
      nivel: this.form.nivel || undefined,
      descuentoDisponible: descuento
    };

    const operacion = this.editando && this.idEditando
      ? this.fidelizacionService.actualizar(this.idEditando, request)
      : this.fidelizacionService.crear(request);

    operacion.subscribe({
      next: () => {
        this.visible = false;
        Swal.fire({
          icon: 'success',
          title: this.editando ? 'Fidelizacion actualizada' : 'Fidelizacion creada',
          text: this.editando
            ? 'Los puntos y beneficios fueron actualizados.'
            : 'El cliente fue agregado al programa de fidelizacion.',
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
          text: 'Ocurrio un problema al guardar el registro.',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
      }
    });
  }

  eliminar(item: FidelizacionModel): void {
    Swal.fire({
      icon: 'warning',
      title: 'Eliminar fidelizacion',
      text: `Seguro que deseas eliminar la fidelizacion de ${item.nombreCliente}?`,
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.fidelizacionService.eliminar(item.idFidelizacion).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Fidelizacion eliminada',
            text: 'El registro fue eliminado correctamente.',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#17213f'
          });
          this.listar();
        },
        error: error => {
          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'No se pudo eliminar',
            text: 'Ocurrio un problema al eliminar el registro.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#17213f'
          });
        }
      });
    });
  }

  nivelClass(nivel: string): string {
    if (nivel === 'VIP') return 'badge-vip';
    if (nivel === 'Oro') return 'badge-gold';
    if (nivel === 'Plata') return 'badge-silver';
    return 'badge-bronze';
  }

  progreso(item: FidelizacionModel): number {
    if (item.nivel === 'VIP') return 100;
    if (item.nivel === 'Oro') return Math.min((item.puntos / 200) * 100, 100);
    if (item.nivel === 'Plata') return Math.min((item.puntos / 100) * 100, 100);
    return Math.min((item.puntos / 50) * 100, 100);
  }

  totalPorNivel(nivel: string): number {
    return this.fidelizaciones.filter(f => f.nivel === nivel).length;
  }

  promedioPuntos(): number {
    if (this.fidelizaciones.length === 0) return 0;

    const total = this.fidelizaciones.reduce((sum, item) => sum + item.puntos, 0);
    return Math.round(total / this.fidelizaciones.length);
  }

  private formVacio(): FidelizacionRequest {
    return {
      idCliente: 0,
      puntos: 0,
      nivel: '',
      descuentoDisponible: 0
    };
  }
}
