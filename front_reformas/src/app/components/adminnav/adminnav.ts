import { Component, HostListener, Input, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

export type SeccionAdmin = 'solicitudes' | 'agenda' | 'clientes';

@Component({
  selector: 'app-admin-nav',
  imports: [RouterLink],
  templateUrl: './adminnav.html',
  styleUrl: './adminnav.scss',
})
export class AdminNav {
  @Input({ required: true }) active!: SeccionAdmin;

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  menuAbierto = signal(false);

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  @HostListener('document:keydown.escape')
  cerrarConEscape(): void {
    this.cerrarMenu();
  }

  cerrarSesion(): void {
    this.cerrarMenu();
    this.auth.cerrarSesion().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }
}
