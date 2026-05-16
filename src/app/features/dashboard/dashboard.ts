import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Plotly, { Config, Data, Layout } from 'plotly.js-dist-min';
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
  imports: [CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {

  @ViewChild('ventasChart') ventasChart?: ElementRef<HTMLDivElement>;
  @ViewChild('pedidosChart') pedidosChart?: ElementRef<HTMLDivElement>;
  @ViewChild('mesasChart') mesasChart?: ElementRef<HTMLDivElement>;
  @ViewChild('stockChart') stockChart?: ElementRef<HTMLDivElement>;

  data?: DashboardResponse;
  ventas: Venta[] = [];
  pedidos: Pedido[] = [];
  productos: Producto[] = [];

  private readonly plotlyConfig: Partial<Config> = {
    displayModeBar: false,
    responsive: true
  };

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
        requestAnimationFrame(() => this.renderizarGraficos());
      },
      error: error => console.error(error)
    });
  }

  ngOnDestroy(): void {
    this.limpiarGraficos();
  }

  private renderizarGraficos(): void {
    if (!this.data) return;

    this.crearGrafico(this.ventasChart, this.dataVentas(), this.layoutBase('Ventas diarias'));
    this.crearGrafico(this.pedidosChart, this.dataPedidos(), this.layoutBase('Cantidad de pedidos'));
    this.crearGrafico(this.mesasChart, this.dataMesas(), this.layoutCircular());
    this.crearGrafico(this.stockChart, this.dataStock(), this.layoutBase('Unidades disponibles', true));
  }

  private limpiarGraficos(): void {
    [this.ventasChart, this.pedidosChart, this.mesasChart, this.stockChart].forEach(ref => {
      if (ref?.nativeElement) {
        Plotly.purge(ref.nativeElement);
      }
    });
  }

  private crearGrafico(
    ref: ElementRef<HTMLDivElement> | undefined,
    data: Data[],
    layout: Partial<Layout>
  ): void {
    if (!ref?.nativeElement) return;
    Plotly.react(ref.nativeElement, data, layout, this.plotlyConfig);
  }

  private dataVentas(): Data[] {
    const dias = this.ultimosDias(7);
    const ventasPorDia = new Map<string, number>();

    this.ventas.forEach(venta => {
      const key = this.fechaKey(venta.fecha);
      ventasPorDia.set(key, (ventasPorDia.get(key) ?? 0) + Number(venta.total ?? 0));
    });

    return [{
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Ventas',
      x: dias.map(dia => dia.label),
      y: dias.map(dia => ventasPorDia.get(dia.key) ?? 0),
      fill: 'tozeroy',
      fillcolor: 'rgba(20, 184, 166, 0.16)',
      line: { color: '#0f766e', width: 3, shape: 'spline' },
      marker: { color: '#0f766e', size: 8 },
      hovertemplate: 'S/ %{y:.2f}<extra></extra>'
    }];
  }

  private dataPedidos(): Data[] {
    const estados = ['Pendiente', 'En Preparacion', 'Entregado', 'Cancelado'];
    const conteo = new Map<string, number>();

    this.pedidos.forEach(pedido => {
      conteo.set(pedido.estado, (conteo.get(pedido.estado) ?? 0) + 1);
    });

    return [{
      type: 'bar',
      name: 'Pedidos',
      x: estados,
      y: estados.map(estado => conteo.get(estado) ?? 0),
      marker: { color: ['#d97706', '#0891b2', '#059669', '#dc2626'] },
      hovertemplate: '%{y} pedidos<extra></extra>'
    }];
  }

  private dataMesas(): Data[] {
    return [{
      type: 'pie',
      labels: ['Ocupadas', 'Disponibles'],
      values: [this.data?.mesasOcupadas ?? 0, this.data?.mesasDisponibles ?? 0],
      hole: 0.62,
      marker: { colors: ['#0891b2', '#94a3b8'] },
      textinfo: 'label+percent',
      hovertemplate: '%{label}: %{value}<extra></extra>'
    }];
  }

  private dataStock(): Data[] {
    const productos = [...this.productos]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);

    const labels = productos.length ? productos.map(producto => producto.nombre) : ['Stock bajo'];
    const values = productos.length ? productos.map(producto => producto.stock) : [this.data?.productosStockBajo ?? 0];

    return [{
      type: 'bar',
      orientation: 'h',
      name: 'Stock',
      x: values,
      y: labels,
      marker: { color: '#e11d48' },
      hovertemplate: '%{x} unidades<extra></extra>'
    }];
  }

  private layoutBase(tituloEjeY: string, horizontal = false): Partial<Layout> {
    return {
      autosize: true,
      margin: { l: horizontal ? 120 : 44, r: 24, t: 12, b: 48 },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
      font: {
        family: 'Inter, sans-serif',
        color: '#475569'
      },
      showlegend: false,
      xaxis: horizontal
        ? { title: { text: tituloEjeY }, gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1' }
        : { gridcolor: '#f1f5f9', zerolinecolor: '#cbd5e1' },
      yaxis: horizontal
        ? { automargin: true, gridcolor: '#f1f5f9' }
        : { title: { text: tituloEjeY }, gridcolor: '#e2e8f0', zerolinecolor: '#cbd5e1', rangemode: 'tozero' }
    };
  }

  private layoutCircular(): Partial<Layout> {
    return {
      autosize: true,
      margin: { l: 24, r: 24, t: 12, b: 24 },
      paper_bgcolor: '#ffffff',
      plot_bgcolor: '#ffffff',
      font: {
        family: 'Inter, sans-serif',
        color: '#475569'
      },
      showlegend: true,
      legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: -0.05
      }
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
}
