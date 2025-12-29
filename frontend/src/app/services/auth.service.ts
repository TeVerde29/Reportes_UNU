import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/auth`;
  constructor(private http: HttpClient) {}

  // 🔐 LOGIN
  login(data: { codigo: string; clave: string }): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      data,
      { withCredentials: true }
    );
  }

  // 👤 OBTENER SESIÓN ACTUAL
  me(): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/me`,
      { withCredentials: true }
    );
  }

  // 🚪 CERRAR SESIÓN
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      { withCredentials: true }
    );
  }
}
