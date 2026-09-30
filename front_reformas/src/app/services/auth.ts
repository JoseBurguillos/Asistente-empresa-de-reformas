import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface UsuarioAdmin {
  id: number;
  usuario: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3001/api/auth';

  usuario = signal<UsuarioAdmin | null>(null);

  iniciarSesion(usuario: string, contrasena: string): Observable<{ ok: boolean; usuario: UsuarioAdmin }> {
    return this.http.post<{ ok: boolean; usuario: UsuarioAdmin }>(
      this.apiUrl + '/login',
      { usuario, contrasena },
      { withCredentials: true }
    ).pipe(tap((respuesta) => this.usuario.set(respuesta.usuario)));
  }

  comprobarSesion(): Observable<{ ok: boolean; usuario: UsuarioAdmin }> {
    return this.http.get<{ ok: boolean; usuario: UsuarioAdmin }>(
      this.apiUrl + '/me',
      { withCredentials: true }
    ).pipe(tap((respuesta) => this.usuario.set(respuesta.usuario)));
  }

  cerrarSesion(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      this.apiUrl + '/logout',
      {},
      { withCredentials: true }
    ).pipe(tap(() => this.usuario.set(null)));
  }
}
