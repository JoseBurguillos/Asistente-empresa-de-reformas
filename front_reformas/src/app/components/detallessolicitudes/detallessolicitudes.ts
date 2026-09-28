import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Foto, Solicitud } from '../../interfaces/solicitud';
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
        const solicitud = respuesta.solicitud;

        if (solicitud.estado !== 'nueva') {
          this.solicitud.set(solicitud);
          this.cargando.set(false);
          return;
        }

        this.solicitudesService
          .actualizarSolicitud(id, { estado: 'en_revision' })
          .subscribe({
            next: (actualizacion) => {
              this.solicitud.set({
                ...solicitud,
                estado: actualizacion.solicitud.estado,
                updated_at: actualizacion.solicitud.updated_at
              });
              this.cargando.set(false);
            },
            error: () => {
              this.solicitud.set(solicitud);
              this.error.set('La solicitud se ha cargado, pero no se pudo marcar como en revisión.');
              this.cargando.set(false);
            }
          });
      },
      error: () => {
        this.error.set('No se ha podido cargar la solicitud.');
        this.cargando.set(false);
      }
    });
  }

  urlMiniaturaDrive(foto: Foto): string {
    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(foto.drive_file_id)}&sz=w1200`;
  }

  urlCarpetaDrive(folderId: string): string {
    return `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`;
  }

  marcarImagenNoDisponible(evento: Event): void {
    (evento.currentTarget as HTMLImageElement).classList.add('imagen-error');
  }

  formatearTexto(valor: string | null | undefined, alternativo = 'No indicado'): string {
    if (!valor) return alternativo;

    const texto = valor.replaceAll('_', ' ');
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
