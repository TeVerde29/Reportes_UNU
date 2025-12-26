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

  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  usuario$ = this.usuarioSubject.asObservable();

  private estudianteSubject = new BehaviorSubject<Estudiante | null>(null);
  estudiante$ = this.estudianteSubject.asObservable();

  constructor(
    private http: HttpClient,
    private estudianteService: EstudianteService
  ) {
    this.cargarDesdeStorage();
  }

  verificarUsuario(payload: LoginPayload): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.apiUrl, payload).pipe(
      tap(resp => {
        if (resp.success && resp.data) {
          this.setUsuario(resp.data);
        }
      })
    );
  }

  private setUsuario(usuario: Usuario): void {
    this.usuarioSubject.next(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    // ✅ CLAVE: limpiar antes de cargar el nuevo (evita “estudiante viejo”)
    this.limpiarEstudiante();
    if (this.esEstudiante(usuario)) {
      this.cargarEstudiante(usuario.id_usuario);
    }
  }

  private cargarEstudiante(idUsuario: number): void {
    this.estudianteService
      .obtenerEstudiantePorIdUsuarioNormalizado(idUsuario)
      .subscribe({
        next: (estudiante) => {
          this.estudianteSubject.next(estudiante);
          if (estudiante) {
            localStorage.setItem('estudiante', JSON.stringify(estudiante));
          } else {
            // si backend devuelve null, aseguras limpieza
            this.limpiarEstudiante();
          }
        },
        error: (err) => {
          console.error('Error al obtener estudiante:', err);
          this.limpiarEstudiante();
        }
      });
  }

  private limpiarEstudiante(): void {
    this.estudianteSubject.next(null);
    localStorage.removeItem('estudiante');
  }

  private cargarDesdeStorage(): void {
    const usuarioStorage = localStorage.getItem('usuario');
    if (!usuarioStorage) return;
    const usuario: Usuario = JSON.parse(usuarioStorage);
    this.usuarioSubject.next(usuario);
    // ✅ Si no es estudiante, no debe existir estudiante
    if (!this.esEstudiante(usuario)) {
      this.limpiarEstudiante();
      return;
    }
    // ✅ Si es estudiante: cargar desde storage si existe, sino pedir al backend
    const estudianteStorage = localStorage.getItem('estudiante');
    if (estudianteStorage) {
      this.estudianteSubject.next(JSON.parse(estudianteStorage));
    } else {
      this.cargarEstudiante(usuario.id_usuario);
    }
  }

  private esEstudiante(usuario: Usuario): boolean {
    return usuario.id_rol !== 1;
  }

  isAdmin(): boolean {
    return this.usuarioSubject.value?.id_rol === 1;
  }

  isAuthenticated(): boolean {
    return !!this.usuarioSubject.value;
  }

  getNombreCompletoEstudiante(): string {
    const e = this.estudianteSubject.value;
    return e
      ? `${e.nombres} ${e.apellido_paterno} ${e.apellido_materno}`.trim()
      : '';
  }

  logout(): void {
    this.usuarioSubject.next(null);
    this.estudianteSubject.next(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('estudiante');
  }
}
