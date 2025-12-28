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

  obtenerMisLikes(idEstudiante: number) {
    return this.http.get<{ success: boolean; data: number[] }>(
      `${this.apiUrl}/${idEstudiante}`
    );
  }

  darLike(reaccion:Reaccion): Observable<ReaccionResponse> {
    return this.http.post<ReaccionResponse>(this.apiUrl, reaccion);
  }

  quitarLike(reaccion:Reaccion): Observable<ReaccionResponse> {
    return this.http.put<ReaccionResponse>(this.apiUrl, reaccion);
  }
  
}
