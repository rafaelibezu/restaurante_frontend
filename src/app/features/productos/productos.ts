import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { delay } from 'rxjs';

import { Producto, ProductoRequest } from '../../core/models/producto';
import { Categoria } from '../../core/models/categoria';
import { ProductoService } from '../../core/services/producto';
import { CategoriaService } from '../../core/services/categoria';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Productos implements OnInit {

  productos: Producto[] = [];
  categorias: Categoria[] = [];
  cargandoListado = false;

  visible = false;
  editando = false;
  idEditando?: number;

  form: ProductoRequest = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    estado: true,
    idCategoria: 0
  };

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarCategorias();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.detectChanges();

    this.productoService.listar().pipe(delay(2000)).subscribe({
      next: data => {
        this.productos = data;
        this.cargandoListado = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoListado = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: data => {
        this.categorias = data.filter(c => c.estado);
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
      precio: 0,
      stock: 0,
      estado: true,
      idCategoria: this.categorias[0]?.idCategoria ?? 0
    };
  }

  editar(producto: Producto): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = producto.idProducto;
    this.form = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      estado: producto.estado,
      idCategoria: producto.idCategoria
    };
  }

  guardar(): void {
    if (this.editando && this.idEditando) {
      this.productoService.actualizar(this.idEditando, this.form).subscribe({
        next: () => {
          this.visible = false;
          alert('Producto actualizado correctamente');
          this.listar();
        }
      });
      return;
    }

    this.productoService.crear(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Producto registrado correctamente');
        this.listar();
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas desactivar este producto?')) return;

    this.productoService.eliminar(id).subscribe({
      next: () => {
        alert('Producto desactivado correctamente');
        this.listar();
      }
    });
  }

  estadoClass(estado: boolean): string {
    return estado ? 'badge-success' : 'badge-danger';
  }
}
