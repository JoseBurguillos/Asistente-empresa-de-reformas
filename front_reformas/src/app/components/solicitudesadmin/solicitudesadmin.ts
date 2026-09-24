import { Component, OnInit, inject } from '@angular/core';
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

  solicitudes: Solicitud[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    this.cargando = true;
    this.error = '';

    this.solicitudesService.obtenerSolicitudes().subscribe({
      next: (respuesta) => {
        this.solicitudes = respuesta.solicitudes;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se han podido cargar las solicitudes.';
        this.cargando = false;
      }
    });
  }
}
