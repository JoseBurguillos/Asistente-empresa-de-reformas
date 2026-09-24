import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Solicitud } from '../../interfaces/solicitud';
import { SolicitudesService } from '../../services/solicitudes';

@Component({
  selector: 'app-solicitudesadmin',
  imports: [CommonModule, RouterLink],
  templateUrl: './solicitudesadmin.html',
  styleUrl: './solicitudesadmin.scss',
})
export class Solicitudesadmin implements OnInit {
  private readonly solicitudesService = inject(SolicitudesService);

  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(true);
  error = signal('');
  eliminandoId = signal<number | null>(null);

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

  eliminarSolicitud(solicitud: Solicitud): void {
    const nombre = solicitud.cliente.nombre || `#${solicitud.id}`;
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar la solicitud de ${nombre}?`
    );

    if (!confirmado) return;

    this.eliminandoId.set(solicitud.id);
    this.error.set('');

    this.solicitudesService.eliminarSolicitud(solicitud.id).subscribe({
      next: () => {
        this.solicitudes.update((solicitudes) =>
          solicitudes.filter((item) => item.id !== solicitud.id)
        );
        this.eliminandoId.set(null);
      },
      error: () => {
        this.error.set('No se ha podido eliminar la solicitud.');
        this.eliminandoId.set(null);
      }
    });
  }
}
