import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(data: { codigo: string; clave: string }): Observable<any> {
    return this.http.post(`${this.API}/login`, data, {
      withCredentials: true
    });
  }

  me(): Observable<any> {
    return this.http.get(`${this.API}/me`, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.API}/logout`, {}, {
      withCredentials: true
    });
  }
}
