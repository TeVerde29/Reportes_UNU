import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ReporteService } from '../../services/reporte.service';
import { Reporte } from '../../models/reporte.interface';
import { EstadoService } from '../../services/estado.service';
import { Estudiante } from '../../models/estudiante.interface';
import { UsuarioService } from '../../services/usuario.service';
import { ReaccionService } from '../../services/reaccion.service';
import { Reaccion } from '../../models/reaccion.interface';

@Component({
  selector: 'app-inicio-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio-list.component.html',
  styleUrl: './inicio-list.component.css'
})
export class InicioListComponent implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  error: string = '';
  estudiante: Estudiante | null = null;
  reaccion: Reaccion | null = null;
  likedByMe: Record<number, boolean> = {};
  likeLoading: Record<number, boolean> = {};

  private estudianteSubscription?: Subscription;
  private misLikesCargados = false;
  private misLikesCargando = false;

  constructor(
    private reporteService: ReporteService,
    private estadoServide: EstadoService,
    private usuarioService: UsuarioService,
    private reaccionService: ReaccionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarReportes();
  }

  cargarReportes(): void {
    this.estadoServide.obtenerEstadoPorNombre('Aceptado').subscribe({
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
              this.misLikesCargados = false;
              //this.intentarCargarMisLikes();
            } else {
              this.error = 'No se pudieron cargar los reportes';
            }
          },
          error: (er) => {
            console.error('Error al obtener los reportes:', er);
            this.error = 'Error al cargar los reportes';
          }
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'Error al obtener estado';
        console.error('Error al obtener estado:', err);
      }
    });
  }

  ngOnDestroy(): void {
    this.estudianteSubscription?.unsubscribe();
  }
/*
  trackByIdReporte(index: number, item: Reporte): number {
    return item.id_reporte;
  }

  isLiked(r: Reporte): boolean {
    return !!this.likedByMe[r.id_reporte];
  }

  private setLikeLoading(idReporte: number, loading: boolean) {
    this.likeLoading[idReporte] = loading;
  }

  private updateCount(r: Reporte, delta: number) {
    const actual = Number((r as any).cantidad_reacciones ?? 0);
    const nuevo = Math.max(0, actual + delta);
    (r as any).cantidad_reacciones = nuevo;
  }
*/
/*
  darLike(r: Reporte): void {
    const idReporte = r.id_reporte;
    if (!this.estudiante) return;
    const idEstudiante =
      (this.estudiante as any).id_estudiante ??
      (this.estudiante as any).id ??
      null;
    if (!idEstudiante) return;
    if (this.likeLoading[idReporte]) return;
    const payload: Reaccion = {
      id_reporte: idReporte,
      id_estudiante: Number(idEstudiante)
    };
    const currentlyLiked = this.isLiked(r);
    this.setLikeLoading(idReporte, true);
    if (currentlyLiked) {
      this.reaccionService.quitarLike(payload).subscribe({
        next: () => {
          this.likedByMe[idReporte] = false;
          this.updateCount(r, -1);
          this.setLikeLoading(idReporte, false);
        },
        error: (err) => {
          const msg = err?.error?.message || '';
          if (msg.includes('No has dado like')) {
            this.likedByMe[idReporte] = false;
          }
          this.setLikeLoading(idReporte, false);
        }
      });
      return;
    }
    this.reaccionService.darLike(payload).subscribe({
      next: () => {
        this.likedByMe[idReporte] = true;
        this.updateCount(r, +1);
        this.setLikeLoading(idReporte, false);
      },
      error: (err) => {
        const msg = err?.error?.message || '';
        if (msg.includes('Ya has dado like')) {
          this.reaccionService.quitarLike(payload).subscribe({
            next: () => {
              this.likedByMe[idReporte] = false;
              this.updateCount(r, -1);
              this.setLikeLoading(idReporte, false);
            },
            error: () => {
              this.likedByMe[idReporte] = false;
              this.setLikeLoading(idReporte, false);
            }
          });
          return;
        }
        this.setLikeLoading(idReporte, false);
      }
    });
  }
*/
/*
  private intentarCargarMisLikes(): void {
    if (!this.estudiante) return;
    if (this.reportes.length === 0) return;
    if (this.misLikesCargados || this.misLikesCargando) return;
    const idEstudiante =
      (this.estudiante as any).id_estudiante ??
      (this.estudiante as any).id ??
      null;
    if (!idEstudiante) return;
    this.misLikesCargando = true;
    this.reaccionService.likesActivosPorIdEstudiante(Number(idEstudiante)).subscribe({
      next: (resp) => {
        const ids = resp?.data ?? [];
        this.likedByMe = {};
        for (const idReporte of ids) {
          this.likedByMe[idReporte] = true;
        }
        this.misLikesCargados = true;
        this.misLikesCargando = false;
      },
      error: () => {
        this.misLikesCargando = false;
      }
    });
  }
*/
  timeAgo(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const diffMs = Date.now() - date.getTime();
    const diff = Math.max(0, diffMs);
    const sec = Math.floor(diff / 1000);
    if (sec < 5) return 'ahora';
    if (sec < 60) return `hace ${sec} s`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `hace ${min} ${min === 1 ? 'min' : 'min'}`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `hace ${hr} ${hr === 1 ? 'hora' : 'horas'}`;
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

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
      return partes[0].charAt(0);
    }
    return partes[0].charAt(0) + partes[partes.length - 1].charAt(0);
  }

}
