import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, map  } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrabajadorService {
  private apiUrl = `${environment.apiUrl}/trabajador`;
  constructor(private http: HttpClient) { }

  

}
