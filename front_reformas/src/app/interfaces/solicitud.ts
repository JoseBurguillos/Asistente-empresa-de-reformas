export interface Cliente {
  id: number;
  nombre: string | null;
  telefono: string;
  email: string | null;
  idioma: string;
}

export interface Foto {
  id: number;
  drive_file_id: string;
  url_drive: string | null;
  nombre_archivo: string | null;
  tipo: string;
}

export interface Solicitud {
  id: number;
  estado: string;
  tipo_proyecto: string | null;
  tipo_obra: string | null;
  estancia: string | null;
  medidas: string | null;
  zona: string | null;
  vivienda_habitada: string | null;
  contacto_preferido: string | null;
  presupuesto: string | null;
  fecha_inicio: string | null;
  detalles: string | null;
  drive_folder_id: string | null;
  notas_internas: string | null;
  created_at: string;
  updated_at: string;
  cliente: Cliente;
  fotos: Foto[];
}

export interface RespuestaSolicitudes {
  ok: boolean;
  solicitudes: Solicitud[];
}
