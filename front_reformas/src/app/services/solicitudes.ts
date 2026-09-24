import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RespuestaSolicitudes,
  Solicitud
} from '../interfaces/solicitud';

@Injectable({
  providedIn: 'root'
})
export class SolicitudesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api/solicitudes';

  obtenerSolicitudes(): Observable<RespuestaSolicitudes> {
    return this.http.get<RespuestaSolicitudes>(this.apiUrl);
  }

  obtenerSolicitud(id: number): Observable<{ ok: boolean; solicitud: Solicitud }> {
    return this.http.get<{ ok: boolean; solicitud: Solicitud }>(
      `${this.apiUrl}/${id}`
    );
  }

  actualizarSolicitud(
    id: number,
    cambios: Partial<Solicitud>
  ): Observable<{ ok: boolean; solicitud: Solicitud }> {
    return this.http.patch<{ ok: boolean; solicitud: Solicitud }>(
      `${this.apiUrl}/${id}`,
      cambios
    );
  }

  eliminarSolicitud(id: number): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.delete<{ ok: boolean; mensaje: string }>(
      `${this.apiUrl}/${id}`
    );
  }
}
