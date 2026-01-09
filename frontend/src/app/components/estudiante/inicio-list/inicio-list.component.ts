import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReporteService } from '../../../services/reporte.service';
import { EstadoService } from '../../../services/estado.service';
import { AuthService } from '../../../services/auth.service';
import { ReaccionService } from '../../../services/reaccion.service';
import { Reporte } from '../../../models/reporte.interface';
import { Reaccion } from '../../../models/reaccion.interface';

@Component({
  selector: 'app-inicio-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio-list.component.html',
  styleUrl: './inicio-list.component.css',
})
export class InicioListComponent implements OnInit, OnDestroy {
  reportes: Reporte[] = [];
  error: string = '';
  likedByMe: Record<number, boolean> = {};
  likeLoading: Record<number, boolean> = {};
  activeTab: 'ultimos' | 'populares' | 'mis-reportes' = 'ultimos';
  private querySubscription?: Subscription;
  private idEstudiante: number = 0;
  private idEstudianteListo = false;

  constructor(
    private reporteService: ReporteService,
    private estadoService: EstadoService,
    private authService: AuthService,
    private reaccionService: ReaccionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarIdEstudiante();
    this.querySubscription = this.route.queryParams.subscribe(params => {
      const tab = params['tab'];
      this.activeTab = (tab === 'populares' || tab === 'mis-reportes') ? tab : 'ultimos';
      this.cargarSegunTab();
    });
  }

  private cargarSegunTab(): void {
    if (this.activeTab === 'ultimos') {
      this.cargarReportesPorFecha();
      return;
    }

    if (this.activeTab === 'populares') {
      this.cargarReportesConMasLikes();
      return;
    }

    // mis-reportes
    if (!this.idEstudianteListo || !this.idEstudiante) {
      // Aún no está el id, no dispares la petición
      return;
    }

    this.cargarMisReportes();
  }


  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
  }

  setActiveTab(tab: 'ultimos' | 'populares' | 'mis-reportes'): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  cargarIdEstudiante(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.idEstudiante = response.data?.id_estudiante ?? 0;
        this.idEstudianteListo = true;
        this.cargarLikesActivos(this.idEstudiante);
        this.cargarSegunTab();
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
        this.error = '';
      } else {
        this.reportes = [];
        this.error = '';
      }
    },
    error: (er) => {
      console.error('Error al obtener los reportes:', er);
      this.reportes = [];
      this.error = 'Error al cargar los reportes';
    },
  });
}

  cargarMisReportes(): void {
    this.error = ''; 
    this.reporteService.obtenerReportesPorIdEstudiante(this.idEstudiante).subscribe({
      next: (resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          this.reportes = resp.data;
          this.error = ''; 
        } else {
          this.reportes = [];
          this.error = 'No se pudieron cargar los reportes';
        }
      },
      error: (er) => {
        console.error('Error al obtener los reportes:', er);
        this.reportes = [];
        this.error = 'Error al cargar los reportes';
      },
    });
  }

  gestionarLike(r: Reporte): void {
    const idReporte = r.id_reporte;
    if (!idReporte || !this.idEstudiante) return;
    if (this.likeLoading[idReporte]) return;
    const payload: Reaccion = {
      id_reporte: idReporte,
      id_estudiante: this.idEstudiante
    };
    const yaTieneLike = !!this.likedByMe[idReporte];
    this.likeLoading[idReporte] = true;
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
}
