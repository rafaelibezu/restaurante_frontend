import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { delay } from 'rxjs';

import { DetallePedidoRequest, Pedido, PedidoRequest } from '../../core/models/pedido';
import { Mesa } from '../../core/models/mesa';
import { Producto } from '../../core/models/producto';
import { PedidoService } from '../../core/services/pedido';
import { MesaService } from '../../core/services/mesa';
import { ProductoService } from '../../core/services/producto';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Pedidos implements OnInit {

  pedidos: Pedido[] = [];
  mesas: Mesa[] = [];
  productos: Producto[] = [];
  cargandoListado = false;
  visible = false;

  form: PedidoRequest = {
    idMesa: 0,
    idUsuario: 0,
    observacion: '',
    detalles: []
  };

  detalleTemp: DetallePedidoRequest = {
    idProducto: 0,
    cantidad: 1
  };

  constructor(
    private pedidoService: PedidoService,
    private mesaService: MesaService,
    private productoService: ProductoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarMesas();
    this.cargarProductos();
  }

  listar(): void {
    this.cargandoListado = true;
    this.cdr.detectChanges();

    this.pedidoService.listar().pipe(delay(2000)).subscribe({
      next: data => {
        this.pedidos = data;
        this.cargandoListado = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoListado = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarMesas(): void {
    this.mesaService.listar().subscribe({
      next: data => {
        this.mesas = data.filter(m => m.estado === 'Libre');
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
    const usuario = this.authService.getUsuario();

    this.visible = true;
    this.form = {
      idMesa: this.mesas[0]?.idMesa ?? 0,
      idUsuario: usuario?.idUsuario ?? 0,
      observacion: '',
      detalles: []
    };
    this.detalleTemp = {
      idProducto: this.productos[0]?.idProducto ?? 0,
      cantidad: 1
    };
  }

  agregarDetalle(): void {
    if (!this.detalleTemp.idProducto || this.detalleTemp.cantidad < 1) return;

    const existente = this.form.detalles.find(d => d.idProducto === this.detalleTemp.idProducto);
    if (existente) {
      existente.cantidad += this.detalleTemp.cantidad;
    } else {
      this.form.detalles.push({ ...this.detalleTemp });
    }

    this.detalleTemp = {
      idProducto: this.productos[0]?.idProducto ?? 0,
      cantidad: 1
    };
  }

  quitarDetalle(index: number): void {
    this.form.detalles.splice(index, 1);
  }

  nombreProducto(idProducto: number): string {
    return this.productos.find(p => p.idProducto === idProducto)?.nombre ?? 'Producto';
  }

  guardar(): void {
    if (!this.form.idMesa || this.form.detalles.length === 0) {
      alert('Selecciona una mesa y agrega al menos un producto.');
      return;
    }

    this.pedidoService.crear(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Pedido registrado correctamente');
        this.listar();
        this.cargarMesas();
      }
    });
  }

  cambiarEstado(pedido: Pedido, estado: string): void {
    this.pedidoService.cambiarEstado(pedido.idPedido, estado).subscribe({
      next: () => {
        alert(`Pedido actualizado a ${estado}`);
        this.listar();
        this.cargarMesas();
      }
    });
  }

  estadoClass(estado: string): string {
    if (estado === 'Entregado') return 'badge-success';
    if (estado === 'Pendiente') return 'badge-warning';
    if (estado === 'Cancelado') return 'badge-danger';
    return 'badge-info';
  }
}
