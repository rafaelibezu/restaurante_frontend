import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
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
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: error => {
        console.error(error);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  textoDescuento(promocion: PublicPromocion): string {
    if (promocion.tipo === 'Porcentaje') {
      return `${promocion.valorDescuento}%`;
    }

    if (promocion.tipo === 'Monto fijo') {
      return `S/ ${promocion.valorDescuento}`;
    }

    return `${promocion.valorDescuento}%`;
  }

  iconoPromocion(promocion: PublicPromocion): string {
    const texto = this.textoPromocion(promocion);

    if (texto.includes('cumple') || texto.includes('birthday')) return '🎂';
    if (texto.includes('frecuente') || texto.includes('fidel')) return '⭐';
    if (texto.includes('almuerzo') || texto.includes('menu') || texto.includes('menú')) return '🍽️';
    if (texto.includes('pareja') || texto.includes('cena')) return '🥂';
    if (texto.includes('familia') || texto.includes('grupo')) return '👨‍👩‍👧‍👦';
    if (texto.includes('delivery') || texto.includes('llevar')) return '🛵';

    return '🎁';
  }

  tonoPromocion(promocion: PublicPromocion): string {
    const texto = this.textoPromocion(promocion);

    if (texto.includes('cumple')) return 'birthday';
    if (texto.includes('frecuente') || texto.includes('fidel')) return 'loyal';
    if (texto.includes('almuerzo') || texto.includes('menu') || texto.includes('menú')) return 'lunch';
    if (texto.includes('pareja') || texto.includes('cena')) return 'dinner';

    return 'default';
  }

  etiquetaPromocion(promocion: PublicPromocion): string {
    const texto = this.textoPromocion(promocion);

    if (texto.includes('cumple')) return 'Cumpleaños';
    if (texto.includes('frecuente') || texto.includes('fidel')) return 'Cliente frecuente';
    if (texto.includes('almuerzo') || texto.includes('menu') || texto.includes('menú')) return 'Almuerzo';
    if (texto.includes('pareja') || texto.includes('cena')) return 'Cena especial';

    return promocion.tipo;
  }

  private textoPromocion(promocion: PublicPromocion): string {
    return `${promocion.nombre} ${promocion.descripcion} ${promocion.tipo}`.toLowerCase();
  }
}
