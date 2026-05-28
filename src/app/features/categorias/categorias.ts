import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { delay } from 'rxjs';

import { Categoria, CategoriaRequest } from '../../core/models/categoria';
import { CategoriaService } from '../../core/services/categoria';

@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './categorias.html',
  styleUrl: './categorias.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Categorias implements OnInit {

  categorias: Categoria[] = [];
  cargandoListado = false;
  visible = false;
  editando = false;
  idEditando?: number;

  form: CategoriaRequest = {
    nombre: '',
    descripcion: '',
    estado: true
  };

  constructor(
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.detectChanges();

    this.categoriaService.listar().pipe(delay(2000)).subscribe({
      next: data => {
        this.categorias = data;
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
      nombre: '',
      descripcion: '',
      estado: true
    };
  }

  editar(categoria: Categoria): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = categoria.idCategoria;
    this.form = {
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado
    };
  }

  guardar(): void {
    if (this.editando && this.idEditando) {
      this.categoriaService.actualizar(this.idEditando, this.form).subscribe({
        next: () => {
          this.visible = false;
          alert('Categoría actualizada correctamente');
          this.listar();
        }
      });
      return;
    }

    this.categoriaService.crear(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Categoría registrada correctamente');
        this.listar();
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas desactivar esta categoría?')) return;

    this.categoriaService.eliminar(id).subscribe({
      next: () => {
        alert('Categoría desactivada correctamente');
        this.listar();
      }
    });
  }

  estadoClass(estado: boolean): string {
    return estado ? 'badge-success' : 'badge-danger';
  }
}
