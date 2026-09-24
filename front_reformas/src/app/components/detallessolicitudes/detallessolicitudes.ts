import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Solicitud } from '../../interfaces/solicitud';
import { SolicitudesService } from '../../services/solicitudes';

@Component({
  selector: 'app-detallessolicitudes',
  imports: [CommonModule, RouterLink],
  templateUrl: './detallessolicitudes.html',
  styleUrl: './detallessolicitudes.scss',
})
export class Detallessolicitudes implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly solicitudesService = inject(SolicitudesService);

  solicitud = signal<Solicitud | undefined>(undefined);
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error.set('La solicitud indicada no es válida.');
      this.cargando.set(false);
      return;
    }

    this.solicitudesService.obtenerSolicitud(id).subscribe({
      next: (respuesta) => {
        this.solicitud.set(respuesta.solicitud);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se ha podido cargar la solicitud.');
        this.cargando.set(false);
      }
    });
  }
}
