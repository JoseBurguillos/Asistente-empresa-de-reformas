import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Solicitud } from '../../interfaces/solicitud';
import { SolicitudesService } from '../../services/solicitudes';

@Component({
  selector: 'app-solicitudesadmin',
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitudesadmin.html',
})
export class Solicitudesadmin implements OnInit {
  private readonly solicitudesService = inject(SolicitudesService);

  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.error.set('');

    this.solicitudesService.obtenerSolicitudes().subscribe({
      next: (respuesta) => {
        this.solicitudes.set(respuesta.solicitudes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se han podido cargar las solicitudes.');
        this.cargando.set(false);
      }
    });
  }
}
