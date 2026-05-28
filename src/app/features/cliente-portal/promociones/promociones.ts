import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicPromocion, PublicService } from '../../../core/services/public';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './promociones.html',
  styleUrl: './promociones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Promociones implements OnInit {

  promociones: PublicPromocion[] = [];
  cargando = true;
  promocionActiva = 0;

  constructor(
    private publicService: PublicService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listarPromociones();
  }

  listarPromociones(): void {
    this.publicService.listarPromocionesVigentes().subscribe({
      next: data => {
        this.promociones = data;
        this.promocionActiva = 0;
        this.cargando = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error(error);
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  anterior(): void {
    if (this.promociones.length === 0) {
      return;
    }

    this.promocionActiva = this.promocionActiva === 0
      ? this.promociones.length - 1
      : this.promocionActiva - 1;
  }

  siguiente(): void {
    if (this.promociones.length === 0) {
      return;
    }

    this.promocionActiva = this.promocionActiva === this.promociones.length - 1
      ? 0
      : this.promocionActiva + 1;
  }

  irA(index: number): void {
    this.promocionActiva = index;
  }

  textoDescuento(promocion: PublicPromocion): string {
    if (this.normalizar(promocion.tipo) === 'monto fijo') {
      return `S/ ${promocion.valorDescuento}`;
    }

    return `${promocion.valorDescuento}%`;
  }

  iconoPromocion(promocion: PublicPromocion): string {
    const texto = this.textoPromocion(promocion);

    if (texto.includes('cumple') || texto.includes('birthday')) return 'CM';
    if (texto.includes('frecuente') || texto.includes('fidel')) return 'CF';
    if (texto.includes('almuerzo') || texto.includes('menu')) return 'AL';
    if (texto.includes('pareja') || texto.includes('cena')) return 'CE';
    if (texto.includes('familia') || texto.includes('grupo')) return 'FA';
    if (texto.includes('delivery') || texto.includes('llevar')) return 'DL';

    return 'PR';
  }

  tonoPromocion(promocion: PublicPromocion): string {
    const texto = this.textoPromocion(promocion);

    if (texto.includes('cumple')) return 'birthday';
    if (texto.includes('frecuente') || texto.includes('fidel')) return 'loyal';
    if (texto.includes('almuerzo') || texto.includes('menu')) return 'lunch';
    if (texto.includes('pareja') || texto.includes('cena')) return 'dinner';

    return 'default';
  }

  etiquetaPromocion(promocion: PublicPromocion): string {
    const texto = this.textoPromocion(promocion);

    if (texto.includes('cumple')) return 'Cumpleanos';
    if (texto.includes('frecuente') || texto.includes('fidel')) return 'Cliente frecuente';
    if (texto.includes('almuerzo') || texto.includes('menu')) return 'Almuerzo';
    if (texto.includes('pareja') || texto.includes('cena')) return 'Cena especial';

    return promocion.tipo;
  }

  private textoPromocion(promocion: PublicPromocion): string {
    return this.normalizar(`${promocion.nombre} ${promocion.descripcion} ${promocion.tipo}`);
  }

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}
