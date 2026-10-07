import { Cliente } from './solicitud';

export interface SolicitudClienteResumen {
  id: number;
  estado: string;
  tipo_proyecto: string | null;
  tipo_obra: string | null;
  zona: string | null;
  contacto_preferido: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientePerfil extends Cliente {
  created_at: string;
  updated_at: string;
  solicitudes: SolicitudClienteResumen[];
}

export interface RespuestaClientes {
  ok: boolean;
  clientes: ClientePerfil[];
}
