// ============================================================
// SERVICIO DE SESIÓN (front)
// Guía: el front NO guarda token ni clave.
// Solo pide al back y la cookie `sid` viaja sola.
//  - login() manda código+clave, el back crea la sesión
//  - me() pregunta "¿quién está logueado?" (lo usan los guards)
//  - logout() borra la sesión en el back
// OJO: todo lleva { withCredentials: true } o la cookie no viaja.
// ============================================================
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  login(data: { codigo: string; clave: string }): Observable<any> {
    return this.http.post(`${this.API}/login`, data, {
      withCredentials: true
    });
  }

  me(): Observable<any> {
    return this.http.get(`${this.API}/me`, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}, {
      withCredentials: true
    });
  }
}
