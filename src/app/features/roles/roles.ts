import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { delay } from 'rxjs';

import { Rol, RolRequest } from '../../core/models/rol';
import { RolService } from '../../core/services/rol';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Roles implements OnInit {

  roles: Rol[] = [];
  cargandoListado = false;
  visible = false;
  editando = false;
  idEditando?: number;

  form: RolRequest = {
    nombreRol: '',
    estado: true
  };

  constructor(
    private rolService: RolService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.detectChanges();

    this.rolService.listar().pipe(delay(2000)).subscribe({
      next: data => {
        this.roles = data;
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
    this.visible = true;
    this.editando = false;
    this.idEditando = undefined;
    this.form = {
      nombreRol: '',
      estado: true
    };
  }

  editar(rol: Rol): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = rol.idRol;
    this.form = {
      nombreRol: rol.nombreRol,
      estado: rol.estado
    };
  }

  guardar(): void {
    if (this.editando && this.idEditando) {
      this.rolService.actualizar(this.idEditando, this.form).subscribe({
        next: () => {
          this.visible = false;
          alert('Rol actualizado correctamente');
          this.listar();
        }
      });
      return;
    }

    this.rolService.crear(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Rol registrado correctamente');
        this.listar();
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas desactivar este rol?')) return;

    this.rolService.eliminar(id).subscribe({
      next: () => {
        alert('Rol desactivado correctamente');
        this.listar();
      }
    });
  }

  estadoClass(estado: boolean): string {
    return estado ? 'badge-success' : 'badge-danger';
  }
}
