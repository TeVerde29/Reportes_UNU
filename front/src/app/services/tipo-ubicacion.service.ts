import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UbicacionResponse } from '../models/ubicacion.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoUbicacionService {
  private apiUrl = `${environment.apiUrl}/tipo-ubicacion`;
  constructor(private http: HttpClient) { }

  obtenerUbicacionesPorId(id: number): Observable<UbicacionResponse> {
    return this.http.get<UbicacionResponse>(`${this.apiUrl}/obtenerUbicacionesPorId/${id}`);
  }
}
