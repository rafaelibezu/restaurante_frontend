import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { Notificacion } from '../../core/models/notification';
import { NotificacionService } from '../../core/services/notification';
import { WebsocketNotificacionService } from '../../core/services/websocket-notificacion';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout implements OnInit, OnDestroy {

  usuario: any;

  notificacionesPendientes: Notificacion[] = [];
  mostrarPanelNotificaciones = false;
  private wsSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacionService: NotificacionService,
    private websocketNotificacionService: WebsocketNotificacionService
  ) {
    this.usuario = this.authService.getUsuario();
  }

  ngOnInit(): void {
    this.cargarNotificacionesPendientes();
    this.websocketNotificacionService.conectar();

    this.wsSubscription = this.websocketNotificacionService.nuevaNotificacion$
      .subscribe(notificacion => {
        if (!notificacion) return;

        this.notificacionesPendientes = [
          notificacion,
          ...this.notificacionesPendientes
        ];

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: notificacion.titulo,
          text: notificacion.mensaje,
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true
        });
      });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.websocketNotificacionService.desconectar();
  }

  cargarNotificacionesPendientes(): void {
    this.notificacionService.listarPendientes().subscribe({
      next: data => this.notificacionesPendientes = data,
      error: error => console.error(error)
    });
  }

  toggleNotificaciones(): void {
    this.mostrarPanelNotificaciones = !this.mostrarPanelNotificaciones;
  }

  irANotificaciones(): void {
    this.mostrarPanelNotificaciones = false;
    this.router.navigate(['/notificaciones']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  puedeVer(rolesPermitidos: string[]): boolean {
    const rol = this.usuario?.rol?.toUpperCase();
    return rolesPermitidos.map(r => r.toUpperCase()).includes(rol);
  }
}
