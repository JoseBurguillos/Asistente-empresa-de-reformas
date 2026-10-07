import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ClientePerfil, SolicitudClienteResumen } from '../../interfaces/cliente-perfil';
import { ClientesService } from '../../services/clientes';
import { AdminNav } from '../adminnav/adminnav';

@Component({
  selector: 'app-clientes',
  imports: [CommonModule, FormsModule, RouterLink, AdminNav],
  templateUrl: './clientes.html',
  styleUrl: './clientes.scss',
})
export class Clientes implements OnInit {
  private readonly clientesService = inject(ClientesService);

  clientes = signal<ClientePerfil[]>([]);
  cargando = signal(true);
  error = signal('');
  busqueda = signal('');

  clientesFiltrados = computed(() => {
    const consulta = this.normalizar(this.busqueda());
    const digitos = this.busqueda().replace(/\D/g, '');

    return this.clientes().filter((cliente) => {
      if (!consulta) return true;
      const texto = this.normalizar([
        cliente.nombre,
        cliente.email,
        cliente.idioma,
        ...cliente.solicitudes.map((solicitud) => solicitud.zona),
      ].filter(Boolean).join(' '));
      const telefono = cliente.telefono.replace(/\D/g, '');
      return texto.includes(consulta) || (!!digitos && telefono.includes(digitos));
    });
  });

  resumen = computed(() => ({
    total: this.clientes().length,
    conEmail: this.clientes().filter((cliente) => !!cliente.email).length,
    recurrentes: this.clientes().filter((cliente) => cliente.solicitudes.length > 1).length,
  }));

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando.set(true);
    this.error.set('');
    this.clientesService.obtenerClientes().subscribe({
      next: (respuesta) => {
        this.clientes.set(respuesta.clientes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se ha podido cargar el directorio de clientes.');
        this.cargando.set(false);
      },
    });
  }

  solicitudReciente(cliente: ClientePerfil): SolicitudClienteResumen | undefined {
    return cliente.solicitudes[0];
  }

  iniciales(nombre: string | null): string {
    return (nombre || 'Cliente').trim().split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase();
  }

  urlTelefono(telefono: string): string {
    return `tel:${telefono.replace(/[^\d+]/g, '')}`;
  }

  urlEmail(email: string): string {
    const parametros = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: email,
      su: 'Contacto de Reformas',
    });
    return `https://mail.google.com/mail/?${parametros.toString()}`;
  }

  nombreProyecto(solicitud?: SolicitudClienteResumen): string {
    const valor = solicitud?.tipo_obra || solicitud?.tipo_proyecto;
    if (!valor) return 'Sin solicitudes registradas';
    const texto = valor.replaceAll('_', ' ');
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  nombreCanal(cliente: ClientePerfil): string {
    return this.solicitudReciente(cliente)?.contacto_preferido === 'email' ? 'Email' : 'WhatsApp';
  }

  private normalizar(valor: string): string {
    return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
