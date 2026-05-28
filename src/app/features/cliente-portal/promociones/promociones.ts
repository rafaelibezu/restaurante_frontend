import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { PublicPromocion, PublicService } from '../../../core/services/public';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, RouterLink],
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
}