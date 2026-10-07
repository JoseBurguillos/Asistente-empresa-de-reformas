import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { RespuestaClientes } from '../interfaces/cliente-perfil';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api/clientes';

  obtenerClientes(): Observable<RespuestaClientes> {
    return this.http.get<RespuestaClientes>(this.apiUrl, { withCredentials: true });
  }
}
