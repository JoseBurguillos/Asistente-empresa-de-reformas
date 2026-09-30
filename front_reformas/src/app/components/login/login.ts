import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  usuario = '';
  contrasena = '';
  cargando = signal(false);
  error = signal('');

  entrar(): void {
    if (!this.usuario.trim() || !this.contrasena) {
      this.error.set('Introduce el usuario y la contraseña.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.auth.iniciarSesion(this.usuario, this.contrasena).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (respuesta) => {
        this.error.set(respuesta.error?.error || 'No se ha podido iniciar sesión.');
        this.cargando.set(false);
      }
    });
  }
}
