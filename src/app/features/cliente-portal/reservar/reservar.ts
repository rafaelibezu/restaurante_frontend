import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicService } from '../../../core/services/public';

@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reservar.html',
  styleUrl: './reservar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Reservar {

  cargando = false;
  exito = '';
  error = '';

  cliente = {
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    fechaNacimiento: '',
    preferencias: '',
    alergias: '',
    estado: true
  };

  reserva = {
    fechaReserva: '',
    horaReserva: '',
    cantidadPersonas: 2,
    observacion: ''
  };

  constructor(
    private publicService: PublicService,
    private cdr: ChangeDetectorRef
  ) {}

  enviarReserva(): void {
    this.exito = '';
    this.error = '';

    if (!this.cliente.nombre || !this.cliente.telefono || !this.reserva.fechaReserva || !this.reserva.horaReserva) {
      this.error = 'Completa los campos obligatorios para registrar tu reserva.';
      return;
    }

    this.cargando = true;

    this.publicService.registrarCliente(this.cliente).subscribe({
      next: clienteCreado => {
        const reservaRequest = {
          idCliente: clienteCreado.idCliente,
          idMesa: 2,
          idUsuario: 1,
          fechaReserva: this.reserva.fechaReserva,
          horaReserva: `${this.reserva.horaReserva}:00`,
          cantidadPersonas: this.reserva.cantidadPersonas,
          estado: 'Pendiente',
          observacion: this.reserva.observacion || 'Reserva desde portal cliente'
        };

        this.publicService.crearReserva(reservaRequest).subscribe({
          next: () => {
            this.cargando = false;
            this.exito = 'Tu reserva fue registrada correctamente. El restaurante la confirmará pronto.';
            this.limpiarFormulario();
            this.cdr.detectChanges();
          },
          error: () => {
            this.cargando = false;
            this.error = 'El cliente se registró, pero hubo un problema al crear la reserva.';
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudo registrar el cliente. Verifica si el teléfono o correo ya existen.';
        this.cdr.detectChanges();
      }
    });
  }

  limpiarFormulario(): void {
    this.cliente = {
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      fechaNacimiento: '',
      preferencias: '',
      alergias: '',
      estado: true
    };

    this.reserva = {
      fechaReserva: '',
      horaReserva: '',
      cantidadPersonas: 2,
      observacion: ''
    };
  }
}