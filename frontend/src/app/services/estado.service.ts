import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoResponse } from '../models/estado.interface';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiUrl = `${environment.apiUrl}/estado`;
  constructor(private http: HttpClient) { }

  obtenerEstados(): Observable<EstadoResponse> {
    return this.http.get<EstadoResponse>(this.apiUrl, { withCredentials: true });
  }

  obtenerEstadoPorNombre(nombre: string): Observable<EstadoResponse> {
    return this.http.get<EstadoResponse>(`${this.apiUrl}/${nombre}`, { withCredentials: true });
  }

  obtenerEstadoPorId(id: number): Observable<EstadoResponse> {
    return this.http.get<EstadoResponse>(`${this.apiUrl}/obtener/${id}`, { withCredentials: true });
  }

}
