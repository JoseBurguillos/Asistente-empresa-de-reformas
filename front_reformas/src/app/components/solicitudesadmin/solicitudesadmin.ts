import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Solicitud } from '../../interfaces/solicitud';
import { SolicitudesService } from '../../services/solicitudes';
import { AdminNav } from '../adminnav/adminnav';

@Component({
  selector: 'app-solicitudesadmin',
  imports: [CommonModule, FormsModule, RouterLink, AdminNav],
  templateUrl: './solicitudesadmin.html',
  styleUrl: './solicitudesadmin.scss',
})
export class Solicitudesadmin implements OnInit {
  private readonly solicitudesService = inject(SolicitudesService);

  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(true);
  error = signal('');
  eliminandoId = signal<number | null>(null);
  busqueda = signal('');
  filtroEstado = signal('');
  filtroContacto = signal('');

  readonly estadosDisponibles = [
    { valor: 'nueva', etiqueta: 'Nueva' },
    { valor: 'en_revision', etiqueta: 'En revisión' },
    { valor: 'visita_programada', etiqueta: 'Visita programada' },
    { valor: 'aceptada', etiqueta: 'Aceptada' },
    { valor: 'presupuesto_preparado', etiqueta: 'Presupuesto preparado' },
    { valor: 'rechazada', etiqueta: 'Rechazada' },
    { valor: 'cancelada', etiqueta: 'Cancelada' },
    { valor: 'completada', etiqueta: 'Completada' }
  ];

  solicitudesFiltradas = computed(() => {
    const textoOriginal = this.busqueda();
    const busqueda = this.normalizar(textoOriginal);
    const consultaTelefono = textoOriginal.replace(/\D/g, '');
    const estado = this.filtroEstado();
    const contacto = this.filtroContacto();

    return this.solicitudes().filter((solicitud) => {
      const nombre = this.normalizar(solicitud.cliente.nombre || '');
      const telefono = String(solicitud.cliente.telefono || '').replace(/\D/g, '');
      const coincideBusqueda = !busqueda || nombre.includes(busqueda) || (!!consultaTelefono && telefono.includes(consultaTelefono));
      const coincideEstado = !estado || solicitud.estado === estado;
      const coincideContacto = !contacto || solicitud.contacto_preferido === contacto;
      return coincideBusqueda && coincideEstado && coincideContacto;
    });
  });

  resumen = computed(() => {
    const solicitudes = this.solicitudes();
    return {
      total: solicitudes.length,
      nuevas: solicitudes.filter((item) => item.estado === 'nueva').length,
      activas: solicitudes.filter((item) => ['en_revision', 'visita_programada', 'aceptada', 'presupuesto_preparado'].includes(item.estado)).length,
      completadas: solicitudes.filter((item) => item.estado === 'completada').length
    };
  });

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroEstado.set('');
    this.filtroContacto.set('');
  }

  private normalizar(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  etiquetaEstado(estado: string): string {
    return this.estadosDisponibles.find((item) => item.valor === estado)?.etiqueta
      || estado.replaceAll('_', ' ');
  }

  etiquetaVisita(estado: Solicitud['visita_estado']): string {
    return {
      sin_programar: 'Sin proponer',
      pendiente_respuesta: 'Esperando respuesta',
      confirmada: 'Confirmada',
      rechazada: 'Pide otra fecha'
    }[estado] || 'Sin proponer';
  }

  etiquetaProyecto(valor: string | null): string {
    if (!valor) return 'Trabajo por definir';
    const texto = valor.replaceAll('_', ' ');
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  iniciales(nombre: string | null): string {
    const valor = (nombre || 'Cliente').trim();
    return valor.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
  }

  cargarSolicitudes(): void {
    this.cargando.set(true);
    this.error.set('');

    this.solicitudesService.obtenerSolicitudes().subscribe({
      next: (respuesta) => {
        this.solicitudes.set([...respuesta.solicitudes].sort( (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
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
