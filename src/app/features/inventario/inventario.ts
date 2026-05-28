import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { delay } from 'rxjs';

import { Inventario, InventarioRequest } from '../../core/models/inventario';
import { Producto } from '../../core/models/producto';
import { InventarioService } from '../../core/services/inventario';
import { ProductoService } from '../../core/services/producto';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InventarioComponent implements OnInit {

  inventario: Inventario[] = [];
  productos: Producto[] = [];
  cargandoListado = false;

  visible = false;
  editando = false;
  idEditando?: number;

  form: InventarioRequest = {
    idProducto: 0,
    cantidadActual: 0,
    stockMinimo: 0
  };

  constructor(
    private inventarioService: InventarioService,
    private productoService: ProductoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarProductos();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.detectChanges();

    this.inventarioService.listar().pipe(delay(2000)).subscribe({
      next: data => {
        this.inventario = data;
        this.cargandoListado = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoListado = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarProductos(): void {
    this.productoService.listar().subscribe({
      next: data => {
        this.productos = data.filter(p => p.estado);
        this.cdr.detectChanges();
      }
    });
  }

  abrirNuevo(): void {
    this.visible = true;
    this.editando = false;
    this.idEditando = undefined;
    this.form = {
      idProducto: this.productos[0]?.idProducto ?? 0,
      cantidadActual: 0,
      stockMinimo: 5
    };
  }

  editar(item: Inventario): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = item.idInventario;
    this.form = {
      idProducto: item.idProducto,
      cantidadActual: item.cantidadActual,
      stockMinimo: item.stockMinimo
    };
  }

  guardar(): void {
    if (this.editando && this.idEditando) {
      this.inventarioService.actualizar(this.idEditando, this.form).subscribe({
        next: () => {
          this.visible = false;
          alert('Inventario actualizado correctamente');
          this.listar();
        }
      });
      return;
    }

    this.inventarioService.crear(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Registro de inventario creado correctamente');
        this.listar();
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas eliminar este registro de inventario?')) return;

    this.inventarioService.eliminar(id).subscribe({
      next: () => {
        alert('Registro eliminado correctamente');
        this.listar();
      }
    });
  }

  stockClass(stockBajo: boolean): string {
    return stockBajo ? 'badge-danger' : 'badge-success';
  }
}
