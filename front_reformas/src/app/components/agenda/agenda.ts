import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Solicitud } from '../../interfaces/solicitud';
import { SolicitudesService } from '../../services/solicitudes';
import { AdminNav } from '../adminnav/adminnav';

interface DiaCalendario {
  fecha: Date;
  clave: string;
  numero: number;
  esMesActual: boolean;
  esHoy: boolean;
  visitas: Solicitud[];
}

@Component({
  selector: 'app-agenda',
  imports: [CommonModule, RouterLink, AdminNav],
  templateUrl: './agenda.html',
  styleUrl: './agenda.scss',
})
export class Agenda implements OnInit {
  private readonly solicitudesService = inject(SolicitudesService);

  private readonly hoy = this.inicioDia(new Date());
  readonly nombresSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  solicitudes = signal<Solicitud[]>([]);
  cargando = signal(true);
  error = signal('');
  mesVisible = signal(this.primerDiaMes(this.hoy));
  diaSeleccionado = signal(this.claveFecha(this.hoy));

  visitasProgramadas = computed(() => {
    return this.solicitudes()
      .filter((solicitud) => {
        if (!solicitud.fecha_visita) return false;
        if (['cancelada', 'rechazada'].includes(solicitud.estado)) return false;
        return solicitud.visita_estado !== 'rechazada';
      })
      .sort((a, b) => this.fechaDe(a).getTime() - this.fechaDe(b).getTime());
  });

  proximasVisitas = computed(() => {
    const ahora = new Date();
    return this.visitasProgramadas().filter((solicitud) => this.fechaDe(solicitud).getTime() >= ahora.getTime());
  });

  diasMes = computed<DiaCalendario[]>(() => {
    const mes = this.mesVisible();
    const inicioCuadricula = this.lunesDeSemana(mes);

    return Array.from({ length: 42 }, (_, indice) => {
      const fecha = new Date(inicioCuadricula);
      fecha.setDate(inicioCuadricula.getDate() + indice);
      const clave = this.claveFecha(fecha);

      return {
        fecha,
        clave,
        numero: fecha.getDate(),
        esMesActual: fecha.getMonth() === mes.getMonth() && fecha.getFullYear() === mes.getFullYear(),
        esHoy: clave === this.claveFecha(this.hoy),
        visitas: this.visitasProgramadas().filter((visita) => this.claveFecha(this.fechaDe(visita)) === clave),
      };
    });
  });

  visitasDia = computed(() => {
    const clave = this.diaSeleccionado();
    return this.visitasProgramadas().filter((solicitud) => this.claveFecha(this.fechaDe(solicitud)) === clave);
  });

  fechaSeleccionada = computed(() => this.fechaDesdeClave(this.diaSeleccionado()));

  tituloMes = computed(() => {
    const titulo = this.mesVisible().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    return this.capitalizarInicial(titulo);
  });

  ngOnInit(): void {
    this.cargarVisitas();
  }

  cargarVisitas(): void {
    this.cargando.set(true);
    this.error.set('');
    this.solicitudesService.obtenerSolicitudes().subscribe({
      next: (respuesta) => {
        this.solicitudes.set(respuesta.solicitudes);
        const siguienteVisita = this.proximasVisitas()[0];

        if (siguienteVisita && this.visitasDia().length === 0) {
          this.irAVisita(siguienteVisita);
        }

        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se ha podido cargar la agenda. Comprueba la conexión e inténtalo de nuevo.');
        this.cargando.set(false);
      },
    });
  }

  seleccionarDia(dia: DiaCalendario): void {
    this.diaSeleccionado.set(dia.clave);

    if (!dia.esMesActual) {
      this.mesVisible.set(this.primerDiaMes(dia.fecha));
    }
  }

  cambiarMes(diferencia: number): void {
    const actual = this.mesVisible();
    const nuevoMes = new Date(actual.getFullYear(), actual.getMonth() + diferencia, 1);
    this.mesVisible.set(nuevoMes);
    this.diaSeleccionado.set(this.claveFecha(nuevoMes));
  }

  irHoy(): void {
    this.mesVisible.set(this.primerDiaMes(this.hoy));
    this.diaSeleccionado.set(this.claveFecha(this.hoy));
  }

  irAVisita(solicitud: Solicitud): void {
    const fecha = this.fechaDe(solicitud);
    this.mesVisible.set(this.primerDiaMes(fecha));
    this.diaSeleccionado.set(this.claveFecha(fecha));
  }

  horaVisita(solicitud: Solicitud): string {
    return this.fechaDe(solicitud).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  fechaLarga(): string {
    const fecha = this.fechaSeleccionada().toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return this.capitalizarInicial(fecha);
  }

  etiquetaDia(dia: DiaCalendario): string {
    const fecha = dia.fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const citas = dia.visitas.length === 0
      ? 'sin visitas'
      : `${dia.visitas.length} ${dia.visitas.length === 1 ? 'visita' : 'visitas'}`;
    return `${fecha}, ${citas}`;
  }

  estadoVisita(solicitud: Solicitud): string {
    return {
      pendiente_respuesta: 'Pendiente de confirmar',
      confirmada: 'Confirmada',
      rechazada: 'Necesita otra fecha',
      sin_programar: 'Programada',
    }[solicitud.visita_estado] || 'Programada';
  }

  private fechaDe(solicitud: Solicitud): Date {
    return new Date(solicitud.fecha_visita || 0);
  }

  private inicioDia(fecha: Date): Date {
    const copia = new Date(fecha);
    copia.setHours(0, 0, 0, 0);
    return copia;
  }

  private primerDiaMes(fecha: Date): Date {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  }

  private lunesDeSemana(fecha: Date): Date {
    const copia = this.inicioDia(fecha);
    const dia = copia.getDay();
    copia.setDate(copia.getDate() - (dia === 0 ? 6 : dia - 1));
    return copia;
  }

  private fechaDesdeClave(clave: string): Date {
    const [ano, mes, dia] = clave.split('-').map(Number);
    return new Date(ano, mes - 1, dia);
  }

  private claveFecha(fecha: Date): string {
    const ano = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private capitalizarInicial(texto: string): string {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
