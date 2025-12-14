import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EstadoResponse } from '../models/estado.interface';

@Injectable({
  providedIn: 'root'
})
export class EstadoService {
  private apiUrl = `${environment.apiUrl}/estado`;
  constructor(private http: HttpClient) { }

  obtenerEstados(): Observable<EstadoResponse> {
    return this.http.get<EstadoResponse>(this.apiUrl);
  }

}
