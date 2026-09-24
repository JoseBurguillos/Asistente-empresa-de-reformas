import { Component, OnInit, inject } from '@angular/core';
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

  solicitud?: Solicitud;
  cargando = true;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'La solicitud indicada no es válida.';
      this.cargando = false;
      return;
    }

    this.solicitudesService.obtenerSolicitud(id).subscribe({
      next: (respuesta) => {
        this.solicitud = respuesta.solicitud;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se ha podido cargar la solicitud.';
        this.cargando = false;
      }
    });
  }
}
