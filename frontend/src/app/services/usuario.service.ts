import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../environment/environment';
import { Usuario, UsuarioResponse } from '../models/usuario.interface';
import { Estudiante } from '../models/estudiante.interface';
import { EstudianteService } from './estudiante.service';

export interface LoginPayload {
  codigo: string;
  clave: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = `${environment.apiUrl}/usuario`;

  
}
