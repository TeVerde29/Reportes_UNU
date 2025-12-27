import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UbicacionResponse } from '../models/ubicacion.interface';

@Injectable({
  providedIn: 'root'
})
export class UbicacionService {
  private apiUrl = `${environment.apiUrl}/ubicacion`;
  constructor(private http: HttpClient) { }

  obtenerUbicaciones(): Observable<UbicacionResponse> {
    return this.http.get<UbicacionResponse>(this.apiUrl);
  }

  obtenerUbicacionesPorId(id: number): Observable<UbicacionResponse> {
    return this.http.get<UbicacionResponse>(`${this.apiUrl}/${id}`);
  }
}
