import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioResponse } from '../models/usuario.interface';

export interface LoginPayload {
  codigo: string;
  clave: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;
  constructor(private http: HttpClient) { }

  verificarUsuario(payload: LoginPayload): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, payload);
  }
}
