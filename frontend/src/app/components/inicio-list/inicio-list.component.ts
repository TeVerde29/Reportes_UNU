import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService } from '../../services/reporte.service';
import { EstadoService } from '../../services/estado.service';
import { AuthService } from '../../services/auth.service';
import { EstudianteService } from '../../services/estudiante.service';
import { ReaccionService } from '../../services/reaccion.service';
import { Reporte } from '../../models/reporte.interface';
import { Estudiante } from '../../models/estudiante.interface';
import { Reaccion } from '../../models/reaccion.interface';
import { Usuario } from '../../models/usuario.interface';

@Component({
  selector: 'app-inicio-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio-list.component.html',
  styleUrl: './inicio-list.component.css',
})
export class InicioListComponent implements OnInit {
  reportes: Reporte[] = [];
  error: string = '';
  estudiante: Estudiante | null = null;
  usuario: Usuario | null = null;
  likedByMe: Record<number, boolean> = {};
  likeLoading: Record<number, boolean> = {};
  reaccion: Reaccion | null = null;
  activeTab: 'ultimos' | 'populares' = 'ultimos';

  constructor(
    private estudianteService: EstudianteService,
    private reporteService: ReporteService,
    private estadoService: EstadoService,
    private authService: AuthService,
    private reaccionService: ReaccionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEstudiante();
    this.cargarReportesPorFecha();
  }

  setActiveTab(tab: 'ultimos' | 'populares'): void {
    this.activeTab = tab;
    if (tab === 'ultimos') {
      this.cargarReportesPorFecha();
    } else {
      this.cargarReportesConMasLikes();
    }
  }

  cargarEstudiante(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.usuario = response.data;
        const idEstudiante = this.usuario?.id_estudiante ?? 0;
        this.cargarLikesActivos(idEstudiante);
        this.estudianteService.obtenerEstudiantePorId(idEstudiante).subscribe({
          next: (resp) => {
            if (resp.success && resp.data) {
              this.estudiante = Array.isArray(resp.data) ? resp.data[0] : resp.data;
            }
          },
          error: (er) => {
            console.error('Error al obtener el estudiante:', er);
          },
        });
      },
      error: (err) => {
        console.error(err);
        this.router.navigateByUrl('/login');
      },
    });
  }

  private cargarLikesActivos(idEstudiante: number): void {
    this.reaccionService.likesActivosPorIdEstudiante(idEstudiante).subscribe({
      next: (resp) => {
        if (!resp?.success) {
          this.likedByMe = {};
          return;
        }
        const data = resp.data;
        const ids: number[] = [];
        if (Array.isArray(data)) {
          for (const item of data) {
            if (typeof item === 'number') {
              ids.push(item);
            } else if (item && typeof item === 'object') {
              const idRep = (item as any).id_reporte;
              if (typeof idRep === 'number') ids.push(idRep);
            }
          }
        }
        const map: Record<number, boolean> = {};
        for (const id of ids) map[id] = true;
        this.likedByMe = map;
      },
      error: (er) => {
        console.error('Error al cargar likes activos:', er);
        this.likedByMe = {};
      },
    });
  }

  cargarReportesPorFecha(): void {
    this.error = '';
    this.estadoService.obtenerEstadoPorNombre('Aceptado').subscribe({
      next: (response) => {
        const estadoAceptado = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!estadoAceptado) {
          this.error = 'No se encontró el estado Aceptado';
          return;
        }
        this.reporteService.obtenerReportesPorIdEstado(estadoAceptado.id_estado).subscribe({
          next: (resp) => {
            if (resp.success && Array.isArray(resp.data)) {
              this.reportes = resp.data;
            } else {
              this.error = 'No se pudieron cargar los reportes';
            }
          },
          error: (er) => {
            console.error('Error al obtener los reportes:', er);
            this.error = 'Error al cargar los reportes';
          },
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al obtener estado';
        console.error('Error al obtener estado:', err);
      },
    });
  }

  cargarReportesConMasLikes(): void {
    this.error = '';
    this.reporteService.obtenerReportesPorMayorReacciones().subscribe({
      next: (resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          this.reportes = resp.data;
        } else {
          this.error = 'No se pudieron cargar los reportes';
        }
      },
      error: (er) => {
        console.error('Error al obtener los reportes:', er);
        this.error = 'Error al cargar los reportes';
      },
    });
  }

  gestionarLike(r: Reporte): void {
    const idReporte = r.id_reporte;
    if (!idReporte || !this.estudiante) return;
    const idEstudiante = (this.estudiante as any).id_estudiante ?? (this.estudiante as any).id;
    if (!idEstudiante) return;
    if (this.likeLoading[idReporte]) return;
    const payload: Reaccion = {
      id_reporte: idReporte,
      id_estudiante: Number(idEstudiante)
    };
    const yaTieneLike = !!this.likedByMe[idReporte];
    this.likeLoading[idReporte] = true; // Activar estado de carga
    if (yaTieneLike) {
      this.reaccionService.quitarLike(payload).subscribe({
        next: () => {
          this.likedByMe[idReporte] = false;
          this.actualizarContador(r, -1);
          this.likeLoading[idReporte] = false;
        },
        error: (err) => {
          console.error('Error al quitar like:', err);
          this.likeLoading[idReporte] = false;
        }
      });
    } else {
      this.reaccionService.darLike(payload).subscribe({
        next: () => {
          this.likedByMe[idReporte] = true;
          this.actualizarContador(r, 1);
          this.likeLoading[idReporte] = false;
        },
        error: (err) => {
          if (err?.error?.message?.includes('Ya has dado like')) {
            this.likedByMe[idReporte] = true;
          }
          this.likeLoading[idReporte] = false;
        }
      });
    }
  }
  
  private actualizarContador(r: Reporte, cambio: number): void {
    if (r.cantidad_reacciones !== undefined) {
      r.cantidad_reacciones = Math.max(0, r.cantidad_reacciones + cambio);
    }
  }

  isLiked(r: Reporte): boolean {
    return !!(r.id_reporte && this.likedByMe[r.id_reporte]);
  }

  trackByIdReporte(index: number, item: Reporte): number {
    return item.id_reporte ?? index;
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
      return partes[0].charAt(0).toUpperCase();
    }
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  timeAgo(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diff = Math.max(0, diffMs);
    const sec = Math.floor(diff / 1000);
    if (sec < 10) return 'ahora';
    if (sec < 60) return `hace ${sec}s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `hace ${min}min`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `hace ${hr}h`;
    const day = Math.floor(hr / 24);
    if (day === 1) return 'ayer';
    if (day < 7) return `hace ${day} días`;
    const week = Math.floor(day / 7);
    if (week < 5) return `hace ${week} ${week === 1 ? 'semana' : 'semanas'}`;
    const month = Math.floor(day / 30);
    if (month < 12) return `hace ${month} ${month === 1 ? 'mes' : 'meses'}`;
    const year = Math.floor(day / 365);
    return `hace ${year} ${year === 1 ? 'año' : 'años'}`;
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login')
    });
  }
}