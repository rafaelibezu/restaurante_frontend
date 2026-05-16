import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Usuario, UsuarioRequest } from '../../core/models/usuario';
import { Rol } from '../../core/models/rol';
import { UsuarioService } from '../../core/services/usuario';
import { RolService } from '../../core/services/rol';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Usuarios implements OnInit {

  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  visible = false;
  editando = false;
  idEditando?: number;

  form: UsuarioRequest = {
    nombre: '',
    correo: '',
    password: '',
    telefono: '',
    estado: true,
    idRol: 0
  };

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listar();
    this.cargarRoles();
  }

  listar(): void {
    this.usuarioService.listar().subscribe({
      next: data => {
        this.usuarios = data;
        this.cdr.detectChanges();
      }
    });
  }

  cargarRoles(): void {
    this.rolService.listar().subscribe({
      next: data => {
        this.roles = data.filter(r => r.estado);
        this.cdr.detectChanges();
      }
    });
  }

  abrirNuevo(): void {
    this.visible = true;
    this.editando = false;
    this.idEditando = undefined;
    this.form = {
      nombre: '',
      correo: '',
      password: '',
      telefono: '',
      estado: true,
      idRol: this.roles[0]?.idRol ?? 0
    };
  }

  editar(usuario: Usuario): void {
    this.visible = true;
    this.editando = true;
    this.idEditando = usuario.idUsuario;
    this.form = {
      nombre: usuario.nombre,
      correo: usuario.correo,
      password: '',
      telefono: usuario.telefono,
      estado: usuario.estado,
      idRol: usuario.idRol
    };
  }

  guardar(): void {
    if (this.editando && this.idEditando) {
      this.usuarioService.actualizar(this.idEditando, this.form).subscribe({
        next: () => {
          this.visible = false;
          alert('Usuario actualizado correctamente');
          this.listar();
        }
      });
      return;
    }

    this.usuarioService.crear(this.form).subscribe({
      next: () => {
        this.visible = false;
        alert('Usuario registrado correctamente');
        this.listar();
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Seguro que deseas desactivar este usuario?')) return;

    this.usuarioService.eliminar(id).subscribe({
      next: () => {
        alert('Usuario desactivado correctamente');
        this.listar();
      }
    });
  }

  estadoClass(estado: boolean): string {
    return estado ? 'badge-success' : 'badge-danger';
  }
}
