import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map  } from 'rxjs';
import { TrabajadorResponse } from '../models/trabajador.interface';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  private apiUrl = `${environment.apiUrl}/trabajador`;
  constructor(private http: HttpClient) { }


  obtenerTrabajadorPorId(id: number): Observable<TrabajadorResponse> {
    return this.http.get<TrabajadorResponse>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

}
