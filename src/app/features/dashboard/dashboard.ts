import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardService } from '../../core/services/dashboard';
import { DashboardResponse } from '../../core/models/dashboard-response';
import { Venta } from '../../core/models/venta';
import { Pedido } from '../../core/models/pedido';
import { Producto } from '../../core/models/producto';
import { VentaService } from '../../core/services/venta';
import { PedidoService } from '../../core/services/pedido';
import { ProductoService } from '../../core/services/producto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {

  data?: DashboardResponse;
  ventas: Venta[] = [];
  pedidos: Pedido[] = [];
  productos: Producto[] = [];

  ventasGrafico: {
    labels: string[];
    values: number[];
    points: string;
    area: string;
    max: number;
  } = this.graficoLineasVacio();

  pedidosGrafico: { label: string; value: number; color: string; height: number }[] = [];
  mesasGrafico = { ocupadas: 0, disponibles: 0, total: 0, ocupadasPct: 0, disponiblesPct: 0 };
  stockGrafico: { label: string; value: number; width: number }[] = [];

  constructor(
    private dashboardService: DashboardService,
    private ventaService: VentaService,
    private pedidoService: PedidoService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    forkJoin({
      dashboard: this.dashboardService.obtenerDashboard(),
      ventas: this.ventaService.listar().pipe(catchError(() => of([] as Venta[]))),
      pedidos: this.pedidoService.listar().pipe(catchError(() => of([] as Pedido[]))),
      productos: this.productoService.listar().pipe(catchError(() => of([] as Producto[])))
    }).subscribe({
      next: response => {
        this.data = response.dashboard;
        this.ventas = response.ventas;
        this.pedidos = response.pedidos;
        this.productos = response.productos;
        this.prepararGraficos();
      },
      error: error => console.error(error)
    });
  }

  private prepararGraficos(): void {
    if (!this.data) return;

    this.ventasGrafico = this.crearVentasGrafico();
    this.pedidosGrafico = this.crearPedidosGrafico();
    this.mesasGrafico = this.crearMesasGrafico();
    this.stockGrafico = this.crearStockGrafico();
  }

  private crearVentasGrafico(): {
    labels: string[];
    values: number[];
    points: string;
    area: string;
    max: number;
  } {
    const dias = this.ultimosDias(7);
    const ventasPorDia = new Map<string, number>();

    this.ventas.forEach(venta => {
      const key = this.fechaKey(venta.fecha);
      ventasPorDia.set(key, (ventasPorDia.get(key) ?? 0) + Number(venta.total ?? 0));
    });

    const values = dias.map(dia => ventasPorDia.get(dia.key) ?? 0);
    const labels = dias.map(dia => dia.label);
    const max = Math.max(...values, 1);
    const points = values
      .map((value, index) => {
        const x = 40 + (index * 700) / Math.max(values.length - 1, 1);
        const y = 220 - (value / max) * 170;
        return `${x},${y}`;
      })
      .join(' ');

    return {
      labels,
      values,
      points,
      area: `40,220 ${points} 740,220`,
      max
    };
  }

  private crearPedidosGrafico(): { label: string; value: number; color: string; height: number }[] {
    const estados = [
      { label: 'Pendiente', color: '#d97706' },
      { label: 'En Preparacion', color: '#0891b2' },
      { label: 'Entregado', color: '#059669' },
      { label: 'Cancelado', color: '#dc2626' }
    ];
    const conteo = new Map<string, number>();

    this.pedidos.forEach(pedido => {
      const estado = this.normalizarEstado(pedido.estado);
      conteo.set(estado, (conteo.get(estado) ?? 0) + 1);
    });

    const values = estados.map(estado => conteo.get(this.normalizarEstado(estado.label)) ?? 0);
    const max = Math.max(...values, 1);

    return estados.map((estado, index) => ({
      ...estado,
      value: values[index],
      height: Math.max((values[index] / max) * 100, values[index] ? 8 : 2)
    }));
  }

  private crearMesasGrafico(): { ocupadas: number; disponibles: number; total: number; ocupadasPct: number; disponiblesPct: number } {
    const ocupadas = this.data?.mesasOcupadas ?? 0;
    const disponibles = this.data?.mesasDisponibles ?? 0;
    const total = Math.max(ocupadas + disponibles, 1);

    return {
      ocupadas,
      disponibles,
      total: ocupadas + disponibles,
      ocupadasPct: Math.round((ocupadas / total) * 100),
      disponiblesPct: Math.round((disponibles / total) * 100)
    };
  }

  private crearStockGrafico(): { label: string; value: number; width: number }[] {
    const productos = [...this.productos]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);

    const items = productos.length
      ? productos.map(producto => ({ label: producto.nombre, value: producto.stock }))
      : [{ label: 'Productos con stock bajo', value: this.data?.productosStockBajo ?? 0 }];
    const max = Math.max(...items.map(item => item.value), 1);

    return items.map(item => ({
      ...item,
      width: Math.max((item.value / max) * 100, item.value ? 8 : 2)
    }));
  }

  private graficoLineasVacio(): { labels: string[]; values: number[]; points: string; area: string; max: number } {
    return {
      labels: [],
      values: [],
      points: '',
      area: '',
      max: 1
    };
  }

  private ultimosDias(cantidad: number): { key: string; label: string }[] {
    const formatter = new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short' });

    return Array.from({ length: cantidad }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (cantidad - 1 - index));
      return {
        key: this.fechaKey(date.toISOString()),
        label: formatter.format(date)
      };
    });
  }

  private fechaKey(fecha: string): string {
    const date = new Date(fecha);
    return Number.isNaN(date.getTime()) ? fecha.slice(0, 10) : date.toISOString().slice(0, 10);
  }

  private normalizarEstado(estado: string): string {
    return estado
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }
}
