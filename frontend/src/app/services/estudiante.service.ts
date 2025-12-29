import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs';
import { EstudianteResponse } from '../models/estudiante.interface';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = `${environment.apiUrl}/estudiante`;
  constructor(private http: HttpClient) { }

  obtenerEstudiantePorId(id: number): Observable<EstudianteResponse> {
    return this.http.get<EstudianteResponse>(`${this.apiUrl}/${id}`);
  }
/*
  obtenerEstudiantePorIdUsuario(id: number): Observable<EstudianteResponse> {
    return this.http.get<EstudianteResponse>(`${this.apiUrl}/usuario/${id}`);
  }
*/
/*
  obtenerEstudiantePorIdUsuarioNormalizado(idUsuario: number): Observable<Estudiante | null> {
    return this.obtenerEstudiantePorIdUsuario(idUsuario).pipe(
      map((resp) => (resp.success ? this.normalizar(resp.data) : null))
    );
  }

  private normalizar(data?: Estudiante | Estudiante[]): Estudiante | null {
    if (!data) return null;
    return Array.isArray(data) ? (data[0] ?? null) : data;
  }
*/
}
