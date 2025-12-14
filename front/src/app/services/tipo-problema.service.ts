import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoProbelmaResponse } from '../models/tipo_problema.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoProblemaService {
  private apiUrl = `${environment.apiUrl}/tipo-problema`;
  constructor(private http: HttpClient) { }

  obtenerTiposProblema(): Observable<TipoProbelmaResponse> {
    return this.http.get<TipoProbelmaResponse>(this.apiUrl);
  }
}
