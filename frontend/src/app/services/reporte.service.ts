import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reporte, ReporteCrearResponse, ReporteResponse } from '../models/reporte.interface';

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/reporte`;
  
  constructor(private http: HttpClient) { }

  // 🔥 IMPORTANTE: Cambiar ReporteCrear por FormData
  crearReporte(formData: FormData): Observable<ReporteCrearResponse> {
    return this.http.post<ReporteCrearResponse>(this.apiUrl, formData);
  }

  // Para actualizar también acepta FormData
  actualizarReporte(id: number, formData: FormData): Observable<ReporteResponse> {
    return this.http.put<ReporteResponse>(`${this.apiUrl}/${id}`, formData);
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