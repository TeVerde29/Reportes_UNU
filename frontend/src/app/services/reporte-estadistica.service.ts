import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../environment/environment';

import {
  EstadisticaPorTipoProblema,
  EstadisticaPorUbicacion,
  EstadisticaTipoProblemaUbicacion,
  EstadisticaPorMes,
  ApiResponse,
} from '../models/estadistica.interface';

@Injectable({
  providedIn: 'root',
})
export class ReporteEstadisticaService {
  private apiUrl = `${environment.apiUrl}/reporte/estadisticas`;

  constructor(private http: HttpClient) {}

  obtenerPorTipoProblema(): Observable<EstadisticaPorTipoProblema[]> {
    return this.http
      .get<ApiResponse<EstadisticaPorTipoProblema[]>>(
        `${this.apiUrl}/tipo-problema`,
        { withCredentials: true }
      )
      .pipe(map((resp) => resp.data ?? []));
  }

  obtenerPorUbicacion(): Observable<EstadisticaPorUbicacion[]> {
    return this.http
      .get<ApiResponse<EstadisticaPorUbicacion[]>>(`${this.apiUrl}/ubicacion`, {
        withCredentials: true,
      })
      .pipe(map((resp) => resp.data ?? []));
  }

  obtenerPorTipoProblemaUbicacion(): Observable<
    EstadisticaTipoProblemaUbicacion[]
  > {
    return this.http
      .get<ApiResponse<EstadisticaTipoProblemaUbicacion[]>>(
        `${this.apiUrl}/tipo-problema-ubicacion`,
        { withCredentials: true }
      )
      .pipe(map((resp) => resp.data ?? []));
  }

  obtenerPorMes(): Observable<EstadisticaPorMes[]> {
    return this.http
      .get<ApiResponse<EstadisticaPorMes[]>>(`${this.apiUrl}/por-mes`, {
        withCredentials: true,
      })
      .pipe(map((resp) => resp.data ?? []));
  }
}
