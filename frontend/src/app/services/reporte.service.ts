import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reporte, ReporteResponse } from '../models/reporte.interface';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reporte`;
  constructor(private http: HttpClient) { }

  crearReporte(reporte: Reporte): Observable<ReporteResponse> {
    return this.http.post<ReporteResponse>(this.apiUrl, reporte);
  }

  actualizarReporte(id: number, reporte: Reporte): Observable<ReporteResponse> {
    return this.http.put<ReporteResponse>(`${this.apiUrl}/${id}`, reporte);
  }

  obtenerReportePorId(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/${id}`);
  }

  obtenerReportesPorIdEstado(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/estado/${id}`);
  }

  obtenerReportesPorMayorReacciones(): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/top/reacciones`);
  }

  obtenerReportesPendientesPorIdEstudiante(id: number): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/pendientes/estudiante/${id}`);
  }

}
