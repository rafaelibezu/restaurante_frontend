import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PublicService, PublicMesa } from '../../../core/services/public';
import Swal from 'sweetalert2';
import { finalize, switchMap } from 'rxjs';


@Component({
  selector: 'app-reservar',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reservar.html',
  styleUrl: './reservar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class Reservar implements OnInit {

  mesasDisponibles: PublicMesa[] = [];
  idMesaSeleccionada: number | null = null;

  fechaMinima = new Date().toISOString().split('T')[0];

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
  ) { }

  ngOnInit(): void {
    this.cargarMesasDisponibles();
  }

  cargarMesasDisponibles(): void {
    this.publicService.listarMesasDisponibles().subscribe({
      next: data => {
        this.mesasDisponibles = data;
        this.asignarMesaSugerida();
        this.cdr.markForCheck();
      },
      error: error => {
        console.error(error);
        this.error = 'No se pudieron cargar las mesas disponibles.';
        this.cdr.markForCheck();
      }
    });
  }

  asignarMesaSugerida(): void {
    const mesaSugerida = this.mesasDisponibles.find(
      mesa => mesa.capacidad >= this.reserva.cantidadPersonas
    );

    this.idMesaSeleccionada = mesaSugerida?.idMesa ?? null;
  }

  enviarReserva(): void {
    this.exito = '';
    this.error = '';

    if (
      !this.cliente.nombre ||
      !this.cliente.telefono ||
      !this.reserva.fechaReserva ||
      !this.reserva.horaReserva
    ) {
      this.error = 'Completa los campos obligatorios para registrar tu reserva.';
      this.cdr.markForCheck();
      return;
    }

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (this.cliente.correo && !correoValido.test(this.cliente.correo)) {
      this.error = 'Ingresa un correo válido, por ejemplo: cliente@gmail.com';
      this.cdr.markForCheck();
      return;
    }

    this.asignarMesaSugerida();

    if (!this.idMesaSeleccionada) {
      this.error = 'No hay mesas disponibles para la cantidad de personas indicada.';
      this.cdr.markForCheck();
      return;
    }

    const hora = this.reserva.horaReserva;

    if (hora < '12:00' || hora > '23:00') {
      Swal.fire({
        icon: 'warning',
        title: 'Horario no disponible',
        text: 'Las reservas solo están disponibles entre 12:00 y 23:00.',
        confirmButtonColor: '#17213f'
      });
      return;
    }

    this.cargando = true;
    this.cdr.markForCheck();

    this.publicService.registrarCliente(this.cliente).pipe(
      switchMap(clienteCreado => {
        const reservaRequest = {
          idCliente: clienteCreado.idCliente,
          idMesa: this.idMesaSeleccionada!,
          idUsuario: 1,
          fechaReserva: this.reserva.fechaReserva,
          horaReserva: `${this.reserva.horaReserva}:00`,
          cantidadPersonas: this.reserva.cantidadPersonas,
          estado: 'Pendiente',
          observacion: this.reserva.observacion || 'Reserva desde portal cliente'
        };

        return this.publicService.crearReserva(reservaRequest);
      }),
      finalize(() => {
        this.cargando = false;
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: reservaCreada => {
        this.limpiarFormulario();

        this.cargando = false;
        this.cdr.markForCheck();

        Swal.fire({
          icon: 'success',
          title: 'Reserva registrada',
          text: `Tu reserva #${reservaCreada.idReserva} fue registrada correctamente. El restaurante la confirmará pronto.`,
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#17213f'
        });
      },
      error: error => {
        console.error(error);

        const mensaje =
          error?.error?.mensaje ||
          error?.error?.message ||
          'Ocurrió un problema al registrar la reserva. Revisa los datos e inténtalo nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'No se pudo registrar',
          text: mensaje,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#17213f'
        });
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

  mesaSeleccionada() {
        return this.mesasDisponibles.find(
          mesa => mesa.idMesa === this.idMesaSeleccionada
        );
      }
    }