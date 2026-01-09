import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Reporte } from '../../../models/reporte.interface';
import { ReporteService } from '../../../services/reporte.service';
import { EstadoService } from '../../../services/estado.service';
import { PendientesFormComponent } from '../pendientes-form/pendientes-form.component';

@Component({
  selector: 'app-aceptados-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PendientesFormComponent
  ],
  templateUrl: './aceptados-list.component.html',
  styleUrl: './aceptados-list.component.css'
})
export class AceptadosListComponent implements OnInit, OnDestroy {

  reportes: Reporte[] = [];
  error = '';
  reporteSeleccionado: Reporte | null = null;
  mostrarModal = false;

  // Lógica de búsqueda y paginación
  filtroTexto: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 5;

  private sub?: Subscription;

  constructor(
    private reporteService: ReporteService,
    private estadoService: EstadoService
  ) {}

  ngOnInit(): void {
    this.reportesAceptados();
  }

  // Getters para filtrado y paginación (Igual que en Pendientes)
  get reportesFiltrados(): Reporte[] {
    if (!this.filtroTexto.trim()) return this.reportes;
    const busqueda = this.filtroTexto.toLowerCase();
    return this.reportes.filter(r =>
      r.titulo?.toLowerCase().includes(busqueda) ||
      r.estudiante?.toLowerCase().includes(busqueda) ||
      r.ubicacion?.toLowerCase().includes(busqueda)
    );
  }

  get reportesPaginados(): Reporte[] {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.reportesFiltrados.slice(inicio, fin);
  }

  get totalReportesDinamico(): number {
    return this.reportesFiltrados.length;
  }

  get totalPaginas(): number {
    return Math.ceil(this.reportesFiltrados.length / this.itemsPorPagina);
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  onSearchChange(): void {
    this.paginaActual = 1;
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  reportesAceptados(): void {
    this.sub = this.estadoService.obtenerEstadoPorNombre('Aceptado').subscribe({
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
              this.paginaActual = 1;
            } else {
              this.error = 'No se pudieron cargar los reportes aceptados';
            }
          },
          error: () => this.error = 'Error al cargar los reportes'
        });
      },
      error: () => this.error = 'Error al obtener estado'
    });
  }

  abrirModal(reporte: Reporte): void {
    this.reporteSeleccionado = reporte;
    this.mostrarModal = true;
    document.body.style.overflow = 'hidden';
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.reporteSeleccionado = null;
    document.body.style.overflow = '';
    this.reportesAceptados();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  protected readonly Math = Math;
}
