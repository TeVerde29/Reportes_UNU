import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioResponse } from '../models/usuario.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/usuario`;
  constructor(private http: HttpClient) { }

  verificarUsuario(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(this.apiUrl);
  }
}
