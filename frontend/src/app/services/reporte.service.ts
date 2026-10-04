import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FiltrosReporte, ReporteResponse } from '../models/reporte.interface';

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

  // Arma ?page=&limit=&id_tipo_problema=&id_ubicacion=&q= solo con lo usado
  private paramsDeFiltros(f?: FiltrosReporte): HttpParams {
    let p = new HttpParams();
    if (!f) return p;
    if (f.page) p = p.set('page', String(f.page));
    if (f.limit) p = p.set('limit', String(f.limit));
    if (f.id_tipo_problema) p = p.set('id_tipo_problema', String(f.id_tipo_problema));
    if (f.id_ubicacion) p = p.set('id_ubicacion', String(f.id_ubicacion));
    if (f.q?.trim()) p = p.set('q', f.q.trim());
    return p;
  }

  obtenerReportesPorIdEstado(id: number, f?: FiltrosReporte): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/estado/${id}`, { params: this.paramsDeFiltros(f), withCredentials: true });
  }

  obtenerReportesPorMayorReacciones(f?: FiltrosReporte): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/top/reacciones`, { params: this.paramsDeFiltros(f), withCredentials: true });
  }

  obtenerReportesPendientesPorIdEstudiante(f?: FiltrosReporte): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/pendientes/estudiante`, { params: this.paramsDeFiltros(f), withCredentials: true });
  }

  obtenerReportesPorIdEstudiante(f?: FiltrosReporte): Observable<ReporteResponse> {
    return this.http.get<ReporteResponse>(`${this.apiUrl}/mis-reportes`, { params: this.paramsDeFiltros(f), withCredentials: true });
  }

  eliminarReporte(id: number): Observable<ReporteResponse> {
    return this.http.delete<ReporteResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

}
