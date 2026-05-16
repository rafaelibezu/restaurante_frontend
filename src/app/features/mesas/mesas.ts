import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Mesa, MesaRequest } from '../../core/models/mesa';
import { MesaService } from '../../core/services/mesa';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './mesas.html',
  styleUrl: './mesas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Mesas implements OnInit {

  mesas: Mesa[] = [];
  visible = false;
  editando = false;
  idEditando?: number;

  estados = [
    { label: 'Libre', value: 'Libre' },
    { label: 'Ocupada', value: 'Ocupada' }
  ];

  form: MesaRequest = {
    numero: 0,
    capacidad: 0,
    estado: 'Libre'
  };

  constructor(
    private mesaService: MesaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.mesaService.listar().subscribe({
      next: data => {
        this.mesas = data;
        this.cdr.detectChanges();
      }
    });
  }

  abrirNuevo(): void {
    this.visible = true;
    this.editando = false;
    this.idEditando = undefined;
    this.form = {
      numero: 0,
      capacidad: 0,
      estado: 'Libre'
    };
  }

  editar(mesa: Mesa): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = mesa.idMesa;
    this.form = {
      numero: mesa.numero,
      capacidad: mesa.capacidad,
      estado: mesa.estado
    };
  }

  guardar(): void {
    if (this.editando && this.idEditando) {
      this.mesaService.actualizar(this.idEditando, this.form).subscribe({
        next: () => {
          this.visible = false;
          alert('Mesa actualizada correctamente');
          this.listar();
        }
      });
      return;
    }

    this.mesaService.crear(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Mesa registrada correctamente');
        this.listar();
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas desactivar esta mesa?')) return;

    this.mesaService.eliminar(id).subscribe({
      next: () => {
        alert('Mesa desactivada correctamente');
        this.listar();
      }
    });
  }

  estadoClass(estado: string): string {
    if (estado === 'Libre') return 'badge-success';
    if (estado === 'Ocupada') return 'badge-warning';
    if (estado === 'Inactiva') return 'badge-danger';
    return 'badge-info';
  }
}
