import { Component, OnInit, OnDestroy, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
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
export class InicioListComponent implements OnInit, AfterViewInit, OnDestroy {
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
  // Filtros + scroll infinito (10 por tanda, el back devuelve `total`)
  tipos: TipoProbelma[] = [];
  ubicaciones: Ubicacion[] = [];
  filtroTipo: number | null = null;
  filtroUbi: number | null = null;
  textoQ: string = '';
  // Marca de scroll por pestaña (solo en memoria: al recargar se pierde)
  private scrollPorTab: Record<'ultimos' | 'populares' | 'mis-reportes', number> = {
    ultimos: 0,
    populares: 0,
    'mis-reportes': 0
  };
  // Estado de paginación por pestaña (se reinicia al cambiar tab/filtros)
  private readonly TAM_PAGINA = 10;
  private pagina = 1;
  private totalReportes = 0;
  cargando = false;      // primera página
  cargandoMas = false;   // siguientes páginas
  hayMas = true;
  private idEstadoAceptado: number | null = null;
  private observador?: IntersectionObserver;
  // El centinela aparece/desaparece con *ngIf: observarlo cada vez que exista
  @ViewChild('centinela') set refCentinela(el: ElementRef | undefined) {
    if (el && this.observador) {
      this.observador.disconnect();
      this.observador.observe(el.nativeElement);
    }
  }
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
      const tab: 'ultimos' | 'populares' | 'mis-reportes' = (params['tab'] === 'populares' || params['tab'] === 'mis-reportes') ? params['tab'] : 'ultimos';
      if (tab === this.activeTab && this.sesionLista) {
        // Re-tocar la pestaña activa: refrescar desde arriba
        this.scrollPorTab[tab] = 0;
        window.scrollTo(0, 0);
      } else if (tab !== this.activeTab) {
        // Guardar dónde quedó la anterior antes de irse
        this.scrollPorTab[this.activeTab] = window.scrollY;
      }
      this.activeTab = tab;
      this.cargarSegunTab();
    });
  }

  private cargarSegunTab(sumar = false): void {
    if (!sumar) this.reiniciarPaginacion();
    if (this.activeTab === 'ultimos') {
      this.cargarReportesPorFecha(sumar);
      return;
    }

    if (this.activeTab === 'populares') {
      this.cargarReportesConMasLikes(sumar);
      return;
    }

    // mis-reportes
    if (!this.sesionLista || !this.codigoEstudiante) {
      // Aún no está la sesión, no dispares la petición
      return;
    }

    this.cargarMisReportes(sumar);
  }

  // Vuelve a página 1 y limpia (cambio de tab o de filtros)
  private reiniciarPaginacion(): void {
    this.pagina = 1;
    this.totalReportes = 0;
    this.hayMas = true;
    this.reportes = [];
    this.error = '';
  }

  // La pide el centinela al acercarse al final (tipo Facebook)
  private cargarMas(): void {
    if (!this.hayMas || this.cargando || this.cargandoMas) return;
    this.pagina++;
    this.cargarSegunTab(true);
  }

  ngAfterViewInit(): void {
    // Seguro prerender: sin IntersectionObserver no hay scroll infinito
    if (typeof IntersectionObserver === 'undefined') return;
    this.observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some(e => e.isIntersecting)) this.cargarMas();
      },
      { rootMargin: '600px' }
    );
  }


  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.busquedaSub?.unsubscribe();
    this.observador?.disconnect();
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

  // Filtros + página actual como query del back (tandas de 10)
  private filtrosActuales(): FiltrosReporte {
    return {
      page: this.pagina,
      limit: this.TAM_PAGINA,
      id_tipo_problema: this.filtroTipo,
      id_ubicacion: this.filtroUbi,
      q: this.textoQ
    };
  }

  // Marca qué rueda mostrar (inicial o "cargando más")
  private marcarCarga(sumar: boolean): void {
    if (sumar) this.cargandoMas = true;
    else this.cargando = true;
  }

  private terminarCarga(): void {
    this.cargando = false;
    this.cargandoMas = false;
  }

  // Pega la página pedida al final (sin duplicados) y decide si hay más
  private asentarPagina(resp: any, sumar: boolean): void {
    const datos: Reporte[] = Array.isArray(resp?.data) ? resp.data : [];
    if (sumar) {
      const vistos = new Set(this.reportes.map(r => r.id_reporte));
      this.reportes = [...this.reportes, ...datos.filter(r => !vistos.has(r.id_reporte))];
    } else {
      this.reportes = datos;
    }
    const total = Number(resp?.total);
    this.totalReportes = Number.isFinite(total) ? total : this.reportes.length;
    this.hayMas = this.reportes.length < this.totalReportes;
    this.terminarCarga();
    // Al volver a una pestaña ya vista, regresar a su marca de scroll;
    // en primera visita, empezar arriba. Reintenta porque las fotos
    // siguen estirando el contenido después del primer pintado.
    if (!sumar) {
      (window as any).__marcasScroll = { ...this.scrollPorTab };
      const y = this.scrollPorTab[this.activeTab] || 0;
      let intentos = 0;
      const intentar = () => {
        window.scrollTo(0, y);
        intentos++;
        if (intentos < 6 && Math.abs(window.scrollY - y) > 4) setTimeout(intentar, 150);
      };
      setTimeout(intentar, 80);
    }
  }

  aplicarFiltros(): void {
    // La lista cambió: la marca vieja ya no vale, volver arriba
    this.scrollPorTab[this.activeTab] = 0;
    window.scrollTo(0, 0);
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
    this.aplicarFiltros();
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

  cargarReportesPorFecha(sumar = false): void {
    this.marcarCarga(sumar);
    this.error = '';
    // El id de Aceptado no cambia: se cachea para no pedirlo en cada página
    if (this.idEstadoAceptado) {
      this.pedirPorEstado(this.idEstadoAceptado, sumar);
      return;
    }
    this.estadoService.obtenerEstadoPorNombre('Aceptado').subscribe({
      next: (response) => {
        const estadoAceptado = Array.isArray(response.data) ? response.data[0] : response.data;
        if (!estadoAceptado) {
          this.terminarCarga();
          this.error = 'No se encontró el estado Aceptado';
          return;
        }
        this.idEstadoAceptado = estadoAceptado.id_estado;
        this.pedirPorEstado(estadoAceptado.id_estado, sumar);
      },
      error: (err) => {
        this.terminarCarga();
        this.error = err?.error?.message || 'Error al obtener estado';
        console.error('Error al obtener estado:', err);
      },
    });
  }

  private pedirPorEstado(idEstado: number, sumar: boolean): void {
    this.reporteService.obtenerReportesPorIdEstado(idEstado, this.filtrosActuales()).subscribe({
      next: (resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          this.asentarPagina(resp, sumar);
        } else {
          if (!sumar) this.reportes = [];
          this.terminarCarga();
          this.error = 'No se pudieron cargar los reportes';
        }
      },
      error: (er) => {
        console.error('Error al obtener los reportes:', er);
        if (!sumar) this.reportes = [];
        this.terminarCarga();
        this.error = 'Error al cargar los reportes';
      },
    });
  }

cargarReportesConMasLikes(sumar = false): void {
  this.marcarCarga(sumar);
  this.error = '';
  this.reporteService.obtenerReportesPorMayorReacciones(this.filtrosActuales()).subscribe({
    next: (resp) => {
      if (resp.success && Array.isArray(resp.data)) {
        this.asentarPagina(resp, sumar);
      } else {
        if (!sumar) this.reportes = [];
        this.terminarCarga();
        this.error = '';
      }
    },
    error: (er) => {
      console.error('Error al obtener los reportes:', er);
      if (!sumar) this.reportes = [];
      this.terminarCarga();
      this.error = 'Error al cargar los reportes';
    },
  });
}

  cargarMisReportes(sumar = false): void {
    this.marcarCarga(sumar);
    this.error = '';
    this.reporteService.obtenerReportesPorIdEstudiante(this.filtrosActuales()).subscribe({
      next: (resp) => {
        if (resp.success && Array.isArray(resp.data)) {
          this.asentarPagina(resp, sumar);
        } else {
          if (!sumar) this.reportes = [];
          this.terminarCarga();
          this.error = 'No se pudieron cargar los reportes';
        }
      },
      error: (er) => {
        console.error('Error al obtener los reportes:', er);
        if (!sumar) this.reportes = [];
        this.terminarCarga();
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
