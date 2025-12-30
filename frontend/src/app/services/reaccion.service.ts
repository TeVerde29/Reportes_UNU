import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reaccion, ReaccionResponse } from '../models/reaccion.interface';

@Injectable({
  providedIn: 'root'
})
export class ReaccionService {
  private apiUrl = `${environment.apiUrl}/reaccion`;
  constructor(private http: HttpClient) { }

  likesActivosPorIdEstudiante(id: number) {
    return this.http.get<ReaccionResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  darLike(reaccion: Reaccion): Observable<ReaccionResponse> {
    return this.http.post<ReaccionResponse>(this.apiUrl, reaccion, { withCredentials: true });
  }

  quitarLike(reaccion: Reaccion): Observable<ReaccionResponse> {
    return this.http.put<ReaccionResponse>(this.apiUrl, reaccion, { withCredentials: true });
  }
  
}
