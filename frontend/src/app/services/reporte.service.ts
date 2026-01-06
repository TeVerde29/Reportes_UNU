import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReporteResponse } from '../models/reporte.interface';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reporte`;

  constructor(private http: HttpClient) {}

  crearReporte(formData: FormData): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(this.apiUrl, formData, { withCredentials: true });
  }

  actualizarReporte(id: number, formData: FormData): Observable<ReporteResponse> {
    return this.http.put<ReporteResponse>(`${this.apiUrl}/${id}`, formData, { withCredentials: true });
  }

  revisarReporte(
    id: number,
    payload: {
      titulo: string;
      descripcion: string;
      id_tipo_problema: number;
      id_estado: number;
    }
  ) {
    return this.http.put(`${this.apiUrl}/revisar/${id}`, payload,{ withCredentials: true });
  }

  obtenerReportePorId(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  obtenerReportesPorIdEstado(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/estado/${id}`, { withCredentials: true });
  }

  obtenerReportesPorMayorReacciones(): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/top/reacciones`, { withCredentials: true });
  }

  obtenerReportesPendientesPorIdEstudiante(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/pendientes/estudiante/${id}`, { withCredentials: true });
  }

}
