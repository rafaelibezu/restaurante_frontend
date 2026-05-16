import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss'
})
export class AdminLayout {

  usuario: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario = this.authService.getUsuario();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  irDashboard(event: MouseEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement | null)?.blur();
    this.router.navigateByUrl('/dashboard');
  }

  esRutaDashboard(): boolean {
    return this.router.url === '/dashboard' || this.router.url === '/';
  }

  puedeVer(rolesPermitidos: string[]): boolean {
    const rol = this.usuario?.rol?.toUpperCase();
    return rolesPermitidos.map(r => r.toUpperCase()).includes(rol);
  }
}
