import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Foto, Solicitud } from '../../interfaces/solicitud';
import { SolicitudesService } from '../../services/solicitudes';

@Component({
  selector: 'app-detallessolicitudes',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detallessolicitudes.html',
  styleUrl: './detallessolicitudes.scss',
})
export class Detallessolicitudes implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly solicitudesService = inject(SolicitudesService);

  solicitud = signal<Solicitud | undefined>(undefined);
  cargando = signal(true);
  error = signal('');
  mensajeGestion = signal('');
  procesando = signal(false);

  fechaVisita = '';
  fechaMinimaVisita = this.fechaLocalParaInput(new Date());
  mensajeVisita = '';
  importePresupuesto: number | null = null;
  mensajePresupuesto = '';

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
        this.inicializarGestion(solicitud);

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

  private fechaLocalParaInput(fecha: Date): string {
    const local = new Date(fecha.getTime() - fecha.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  private inicializarGestion(solicitud: Solicitud): void {
    if (solicitud.fecha_visita) {
      const fecha = new Date(solicitud.fecha_visita);
      this.fechaVisita = this.fechaLocalParaInput(fecha);
    }

    this.importePresupuesto = solicitud.presupuesto === null ? null : Number(solicitud.presupuesto);
    this.mensajeVisita = this.crearMensajeVisita(
      solicitud,
      solicitud.fecha_visita ? new Date(solicitud.fecha_visita) : undefined
    );
    this.mensajePresupuesto = this.crearMensajePresupuesto(solicitud);
  }

  prepararVisita(solicitud: Solicitud): void {
    if (!this.fechaVisita) {
      this.mensajeGestion.set('Indica el día y la hora de la visita.');
      return;
    }

    const fecha = new Date(this.fechaVisita);
    if (Number.isNaN(fecha.getTime())) {
      this.mensajeGestion.set('La fecha de la visita no es válida.');
      return;
    }

    if (fecha.getTime() < Date.now()) {
      this.mensajeGestion.set('La visita debe programarse para una fecha y hora futuras.');
      return;
    }

    const mensaje = !this.mensajeVisita.trim() || this.mensajeVisita.includes('[indica primero')
      ? this.crearMensajeVisita(solicitud, fecha)
      : this.mensajeVisita.trim();
    this.guardarYAbrirWhatsApp(
      solicitud,
      { fecha_visita: fecha.toISOString(), estado: 'visita_programada' },
      mensaje,
      'Visita guardada. Se ha abierto WhatsApp con el mensaje preparado.'
    );
  }

  actualizarMensajeVisita(solicitud: Solicitud): void {
    const fecha = new Date(this.fechaVisita);
    if (!Number.isNaN(fecha.getTime())) this.mensajeVisita = this.crearMensajeVisita(solicitud, fecha);
  }

  actualizarMensajePresupuesto(solicitud: Solicitud): void {
    this.mensajePresupuesto = this.crearMensajePresupuesto(solicitud, Number(this.importePresupuesto));
  }

  solicitudAceptada(estado: string): boolean {
    return ['aceptada', 'presupuesto_preparado', 'en_ejecucion', 'completada'].includes(estado);
  }

  aceptarSolicitud(solicitud: Solicitud): void {
    this.procesando.set(true);
    this.mensajeGestion.set('');
    this.solicitudesService.actualizarSolicitud(solicitud.id, { estado: 'aceptada' }).subscribe({
      next: (respuesta) => {
        this.actualizarSolicitudLocal(respuesta.solicitud);
        this.mensajeGestion.set('Solicitud aceptada correctamente.');
        this.procesando.set(false);
      },
      error: () => {
        this.mensajeGestion.set('No se ha podido aceptar la solicitud.');
        this.procesando.set(false);
      }
    });
  }

  completarSolicitud(solicitud: Solicitud): void {
    if (!window.confirm('¿Confirmas que esta obra está completada?')) return;

    this.procesando.set(true);
    this.mensajeGestion.set('');
    this.solicitudesService.actualizarSolicitud(solicitud.id, { estado: 'completada' }).subscribe({
      next: (respuesta) => {
        this.actualizarSolicitudLocal(respuesta.solicitud);
        this.mensajeGestion.set('La obra se ha marcado como completada.');
        this.procesando.set(false);
      },
      error: () => {
        this.mensajeGestion.set('No se ha podido completar la obra.');
        this.procesando.set(false);
      }
    });
  }

  prepararPresupuesto(solicitud: Solicitud): void {
    const presupuesto = Number(this.importePresupuesto);
    if (!Number.isFinite(presupuesto) || presupuesto <= 0) {
      this.mensajeGestion.set('Indica un importe numérico mayor que cero.');
      return;
    }

    const mensaje = !this.mensajePresupuesto.trim() || this.mensajePresupuesto.includes('[importe pendiente]')
      ? this.crearMensajePresupuesto(solicitud, presupuesto)
      : this.mensajePresupuesto.trim();
    this.guardarYAbrirWhatsApp(
      solicitud,
      { presupuesto, estado: 'presupuesto_preparado' },
      mensaje,
      'Presupuesto guardado. Se ha abierto WhatsApp con el mensaje preparado.'
    );
  }

  private guardarYAbrirWhatsApp(
    solicitud: Solicitud,
    cambios: Partial<Solicitud>,
    mensaje: string,
    confirmacion: string
  ): void {
    const ventana = window.open('', '_blank');
    this.procesando.set(true);
    this.mensajeGestion.set('');

    this.solicitudesService.actualizarSolicitud(solicitud.id, cambios).subscribe({
      next: (respuesta) => {
        this.actualizarSolicitudLocal(respuesta.solicitud);
        const url = this.urlWhatsApp(solicitud.cliente.telefono, mensaje);
        if (ventana) ventana.location.href = url;
        else window.location.href = url;
        this.mensajeGestion.set(confirmacion);
        this.procesando.set(false);
      },
      error: () => {
        ventana?.close();
        this.mensajeGestion.set('No se han podido guardar los cambios.');
        this.procesando.set(false);
      }
    });
  }

  private actualizarSolicitudLocal(cambios: Solicitud): void {
    this.solicitud.update((actual) => actual ? { ...actual, ...cambios, cliente: actual.cliente, fotos: actual.fotos } : actual);
  }

  private urlWhatsApp(telefono: string, mensaje: string): string {
    let numero = telefono.replace(/\D/g, '');
    if (numero.length === 9) numero = '34' + numero;
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje);
  }

  private crearMensajeVisita(solicitud: Solicitud, fecha?: Date): string {
    const nombre = solicitud.cliente.nombre ? ' ' + solicitud.cliente.nombre : '';
    const fechaTexto = fecha
      ? fecha.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })
      : '[indica primero la fecha y la hora]';
    return 'Hola' + nombre + ', somos el equipo de Reformas. Te proponemos realizar la visita para valorar tu solicitud #' + solicitud.id + ' el ' + fechaTexto + '. ¿Te viene bien?';
  }

  private crearMensajePresupuesto(solicitud: Solicitud, presupuesto?: number): string {
    const nombre = solicitud.cliente.nombre ? ' ' + solicitud.cliente.nombre : '';
    const valor = presupuesto || this.importePresupuesto;
    const importe = valor && Number.isFinite(valor)
      ? valor.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
      : '[importe pendiente]';
    return 'Hola' + nombre + ', ya tenemos preparado el presupuesto de tu solicitud #' + solicitud.id + ': ' + importe + '. Si tienes alguna duda, puedes responder a este mensaje.';
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
