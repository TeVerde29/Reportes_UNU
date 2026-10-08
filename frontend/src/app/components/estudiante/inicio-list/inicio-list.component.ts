import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ReporteService } from '../../../services/reporte.service';
import { EstadoService } from '../../../services/estado.service';
import { AuthService } from '../../../services/auth.service';
import { ReaccionService } from '../../../services/reaccion.service';
import { UbicacionService } from '../../../services/ubicacion.service';
import { TipoProblemaService } from '../../../services/tipo-problema.service';
import { Reporte, FiltrosReporte } from '../../../models/reporte.interface';
import { environment } from '../../../environment/environment';
import { resolverFotoUrl } from '../../../utils/foto-url';
import { Reaccion } from '../../../models/reaccion.interface';
import { Ubicacion } from '../../../models/ubicacion.interface';
import { TipoProbelma } from '../../../models/tipoProblema.interface';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-inicio-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './inicio-list.component.html',
  styleUrl: './inicio-list.component.css',
})
export class InicioListComponent implements OnInit, OnDestroy {
  reportes: Reporte[] = [];
  error: string = '';
  likedByMe: Record<number, boolean> = {};
  likeLoading: Record<number, boolean> = {};
  activeTab: 'ultimos' | 'populares' | 'mis-reportes' = 'ultimos';
  readonly baseUrl = environment.baseUrl;
  private querySubscription?: Subscription;
  private busqueda$ = new Subject<string>();
  private busquedaSub?: Subscription;
  private codigoEstudiante: string = '';
  private sesionLista = false;
  // Filtros + se trae todo (sin paginación ni "Ver más")
  tipos: TipoProbelma[] = [];
  ubicaciones: Ubicacion[] = [];
  filtroTipo: number | null = null;
  filtroUbi: number | null = null;
  textoQ: string = '';
  // Visor de foto completa
  fotoAmpliada: string | null = null;
  fotoTitulo: string = '';
  private indiceAmpliada: number = -1;

  constructor(
    private reporteService: ReporteService,
    private estadoService: EstadoService,
    private authService: AuthService,
    private reaccionService: ReaccionService,
    private ubicacionService: UbicacionService,
    private tipoProblemaService: TipoProblemaService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.cargarSesion();
    this.cargarCatalogos();
    this.busquedaSub = this.busqueda$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => this.aplicarFiltros());
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
    if (!this.sesionLista || !this.codigoEstudiante) {
      // Aún no está la sesión, no dispares la petición
      return;
    }

    this.cargarMisReportes();
  }


  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.busquedaSub?.unsubscribe();
    // Seguro: si el visor quedó abierto al salir, libera el scroll del body
    document.body.style.overflow = '';
  }

  setActiveTab(tab: 'ultimos' | 'populares' | 'mis-reportes'): void {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }

  // Catálogos para los filtros
  private cargarCatalogos(): void {
    this.tipoProblemaService.obtenerTiposProblema().subscribe({
      next: (res) => { this.tipos = Array.isArray(res.data) ? res.data : []; },
      error: () => { this.tipos = []; }
    });
    this.ubicacionService.obtenerUbicaciones().subscribe({
      next: (res) => { this.ubicaciones = Array.isArray(res.data) ? res.data : []; },
      error: () => { this.ubicaciones = []; }
    });
  }

  // Filtros actuales como query del back (se trae todo de una vez)
  private filtrosActuales(): FiltrosReporte {
    return {
      limit: 500,
      id_tipo_problema: this.filtroTipo,
      id_ubicacion: this.filtroUbi,
      q: this.textoQ
    };
  }

  aplicarFiltros(): void {
    this.cargarSegunTab();
  }

  // Buscar escribe y filtra solo (con pausa para no saturar)
  buscarEscribiendo(): void {
    this.busqueda$.next(this.textoQ);
  }

  // X dentro del buscador: borra el texto y refiltra sin mover nada
  limpiarTexto(): void {
    this.textoQ = '';
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroTipo = null;
    this.filtroUbi = null;
    this.textoQ = '';
    this.cargarSegunTab();
  }

  cargarSesion(): void {
    this.authService.me().subscribe({
      next: (response) => {
        this.codigoEstudiante = response.data?.codigo_estudiante ?? '';
        this.sesionLista = true;
        this.cargarLikesActivos();
        this.cargarSegunTab();
      },
      error: (err) => {
        console.error(err);
        this.router.navigateByUrl('/login');
      },
    });
  }

  private cargarLikesActivos(): void {
    this.reaccionService.likesActivosPorIdEstudiante().subscribe({
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
        this.reporteService.obtenerReportesPorIdEstado(estadoAceptado.id_estado, this.filtrosActuales()).subscribe({
          next: (resp) => {
            if (resp.success && Array.isArray(resp.data)) {
              this.reportes = resp.data;
            } else {
              this.reportes = [];
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
  this.reporteService.obtenerReportesPorMayorReacciones(this.filtrosActuales()).subscribe({
    next: (resp) => {
      if (resp.success && Array.isArray(resp.data)) {
        this.reportes = resp.data;
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
    this.reporteService.obtenerReportesPorIdEstudiante(this.filtrosActuales()).subscribe({
      next: (resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          this.reportes = resp.data;
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
    if (!idReporte || !this.codigoEstudiante) return;
    if (this.likeLoading[idReporte]) return;
    const payload: Reaccion = {
      id_reporte: idReporte
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

  // Muestra "FACULTAD DE X" como "Fac. X"
  tituloCorto(texto: string | undefined): string {
    if (!texto) return '';
    const t = texto.toLowerCase().replace(/(^|\s|[-(])\p{L}/gu, m => m.toUpperCase());
    return t.replace(/^Facultad De /, 'Fac. ');
  }

  // Columnas para masonry cronológico: pares a la izq, impares a la der
  get colIzquierda(): Reporte[] {
    return this.reportes.filter((_, i) => i % 2 === 0);
  }

  get colDerecha(): Reporte[] {
    return this.reportes.filter((_, i) => i % 2 === 1);
  }

  // Visor de foto completa tipo Facebook (fondo, X, Escape, flechas)
  abrirFoto(r: Reporte): void {
    if (!r.foto_url) return;
    this.indiceAmpliada = this.reportes.findIndex(x => x.id_reporte === r.id_reporte);
    this.mostrarAmpliada();
    document.body.style.overflow = 'hidden';
  }

  cerrarFoto(): void {
    this.fotoAmpliada = null;
    this.indiceAmpliada = -1;
    document.body.style.overflow = '';
  }

  private mostrarAmpliada(): void {
    const r = this.reportes[this.indiceAmpliada];
    if (!r?.foto_url) return;
    this.fotoAmpliada = this.fotoSrc(r.foto_url);
    this.fotoTitulo = r.titulo || 'Foto del reporte';
  }

  // Nube (URL absoluta) se usa tal cual, disco (ruta relativa) lleva baseUrl
  fotoSrc(url?: string | null): string | null {
    return resolverFotoUrl(url);
  }

  @HostListener('document:keydown', ['$event'])
  teclaVisor(event: KeyboardEvent): void {
    if (!this.fotoAmpliada) return;
    if (event.key === 'Escape') this.cerrarFoto();
  }

  // Si la foto no carga (back caído o archivo borrado), muestra aviso
  imgRota(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="300"><rect width="100%" height="100%" fill="#F0F4F2"/><text x="50%" y="50%" fill="#6C7A74" font-size="18" text-anchor="middle" font-family="sans-serif">Imagen no disponible</text></svg>`
    );
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return 'U';
    const partes = nombre.trim().split(' ');
    if (partes.length === 1) {
      return partes[0].charAt(0).toUpperCase();
    }
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
  }

  // Estilo Facebook: relativo hasta 1 semana, luego fecha exacta
  // Se usa fecha_edicion (igual que el orden): lo recién movido sale primero
  etiquetaFecha(r: Reporte): string {
    const value: any = r.fecha_edicion || r.fecha_reporte;
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const dias = Math.floor(Math.max(0, Date.now() - date.getTime()) / 86400000);
    if (dias >= 14) {
      const dd = String(date.getDate()).padStart(2, '0');
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}/${date.getFullYear()}`;
    }
    return this.timeAgo(value);
  }

  fechaExacta(r: Reporte): string {
    const value: any = r.fecha_reporte || r.fecha_edicion;
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return '';
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${date.getFullYear()} ${hh}:${min}`;
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
    return 'hace 1 semana';
  }
}
