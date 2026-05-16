import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Chart, ChartConfiguration, ChartOptions, ChartTypeRegistry, TooltipItem, registerables } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard';
import { DashboardResponse } from '../../core/models/dashboard-response';
import { Venta } from '../../core/models/venta';
import { Pedido } from '../../core/models/pedido';
import { Producto } from '../../core/models/producto';
import { VentaService } from '../../core/services/venta';
import { PedidoService } from '../../core/services/pedido';
import { ProductoService } from '../../core/services/producto';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  @ViewChild('ventasChart') ventasChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('pedidosChart') pedidosChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('mesasChart') mesasChart?: ElementRef<HTMLCanvasElement>;
  @ViewChild('stockChart') stockChart?: ElementRef<HTMLCanvasElement>;

  data?: DashboardResponse;
  ventas: Venta[] = [];
  pedidos: Pedido[] = [];
  productos: Producto[] = [];
  charts: Array<{ destroy(): void }> = [];

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
        setTimeout(() => this.renderizarGraficos());
      },
      error: error => console.error(error)
    });
  }

  ngOnDestroy(): void {
    this.destruirGraficos();
  }

  private renderizarGraficos(): void {
    if (!this.data) return;

    this.destruirGraficos();

    this.crearGrafico(this.ventasChart, this.configVentas());
    this.crearGrafico(this.pedidosChart, this.configPedidos());
    this.crearGrafico(this.mesasChart, this.configMesas());
    this.crearGrafico(this.stockChart, this.configStock());
  }

  private destruirGraficos(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  private crearGrafico<T extends keyof ChartTypeRegistry>(
    ref: ElementRef<HTMLCanvasElement> | undefined,
    config: ChartConfiguration<T>
  ): void {
    if (!ref?.nativeElement) return;
    this.charts.push(new Chart(ref.nativeElement, config));
  }

  private configVentas(): ChartConfiguration<'line'> {
    const dias = this.ultimosDias(7);
    const ventasPorDia = new Map<string, number>();

    this.ventas.forEach(venta => {
      const key = this.fechaKey(venta.fecha);
      ventasPorDia.set(key, (ventasPorDia.get(key) ?? 0) + Number(venta.total ?? 0));
    });

    return {
      type: 'line',
      data: {
        labels: dias.map(dia => dia.label),
        datasets: [{
          label: 'Ventas',
          data: dias.map(dia => ventasPorDia.get(dia.key) ?? 0),
          borderColor: '#0f766e',
          backgroundColor: 'rgba(20, 184, 166, 0.16)',
          fill: true,
          tension: 0.38,
          pointBackgroundColor: '#0f766e',
          pointRadius: 4
        }]
      },
      options: this.baseOptions<'line'>('S/')
    };
  }

  private configPedidos(): ChartConfiguration<'bar'> {
    const estados = ['Pendiente', 'En Preparacion', 'Entregado', 'Cancelado'];
    const conteo = new Map<string, number>();

    this.pedidos.forEach(pedido => {
      conteo.set(pedido.estado, (conteo.get(pedido.estado) ?? 0) + 1);
    });

    return {
      type: 'bar',
      data: {
        labels: estados,
        datasets: [{
          label: 'Pedidos',
          data: estados.map(estado => conteo.get(estado) ?? 0),
          backgroundColor: ['#d97706', '#0891b2', '#059669', '#dc2626'],
          borderRadius: 8
        }]
      },
      options: this.baseOptions<'bar'>()
    };
  }

  private configMesas(): ChartConfiguration<'doughnut'> {
    return {
      type: 'doughnut',
      data: {
        labels: ['Ocupadas', 'Disponibles'],
        datasets: [{
          data: [this.data?.mesasOcupadas ?? 0, this.data?.mesasDisponibles ?? 0],
          backgroundColor: ['#0891b2', '#94a3b8'],
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              color: '#475569',
              font: { family: 'Inter, sans-serif' }
            }
          }
        }
      }
    };
  }

  private configStock(): ChartConfiguration<'bar'> {
    const productos = [...this.productos]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);

    const labels = productos.length ? productos.map(producto => producto.nombre) : ['Stock bajo'];
    const values = productos.length ? productos.map(producto => producto.stock) : [this.data?.productosStockBajo ?? 0];

    return {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Stock',
          data: values,
          backgroundColor: '#e11d48',
          borderRadius: 8
        }]
      },
      options: {
        ...this.baseOptions<'bar'>(),
        indexAxis: 'y'
      }
    };
  }

  private baseOptions<T extends 'bar' | 'line'>(prefix = ''): ChartOptions<T> {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: TooltipItem<T>) => {
              const parsed = context.parsed as { x?: number; y?: number };
              const dataset = context.dataset as { label?: string };
              return `${dataset.label ?? 'Valor'}: ${prefix ? `${prefix} ` : ''}${parsed.y ?? parsed.x ?? 0}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748b', font: { family: 'Inter, sans-serif' } }
        },
        y: {
          beginAtZero: true,
          grid: { color: '#e2e8f0' },
          ticks: { color: '#64748b', font: { family: 'Inter, sans-serif' } }
        }
      }
    } as unknown as ChartOptions<T>;
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
    return new Date(fecha).toISOString().slice(0, 10);
  }
}
