import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
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
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {
    if (this.cargando) return;

    this.error = '';
    this.cargando = true;

    this.authService.login({
      correo: this.correo,
      password: this.password
    }).subscribe({
      next: async (usuario) => {
        this.cargando = false;

        await Swal.fire({
          icon: 'success',
          title: `Bienvenido, ${usuario.nombre || 'usuario'}`,
          text: usuario.rol ? `Has ingresado como ${usuario.rol}.` : 'Inicio de sesion exitoso.',
          confirmButtonText: 'Ir al panel',
          confirmButtonColor: '#17213f',
          timer: 2600,
          timerProgressBar: true,
          allowOutsideClick: false
        });

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.cargando = false;
        this.error = 'Correo o contrasena incorrectos';
      }
    });
  }
}
