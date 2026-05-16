import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  correo = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {
    this.error = '';

    this.authService.login({
      correo: this.correo,
      password: this.password
    }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.error = 'Correo o contraseña incorrectos'
    });
  }
}